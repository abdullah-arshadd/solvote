import React, { useState, useEffect, useCallback } from "react";
import { Connection, PublicKey, SystemProgram, Transaction, TransactionInstruction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { programId, rpcList, SEED_REGISTRY, SEED_VOTER, SEED_VOTER_REGISTRY } from "./utils/constants";
import { PollData, CandidateData, VoteRecordData } from "./utils/types";
import { buildInstructionData, toLEBytes } from "./utils/helpers";
import { parsePoll, parseCandidate } from "./utils/persers";
import ToastContainer, { toast } from "./components/ToastContainer";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import PollList from "./pages/PollList";
import PollDetailPage from "./pages/PollDetailPage";
import CreatePollPage from "./pages/CreatePollPage";

const getRegistryPda = async () => {
  const [pda] = await PublicKey.findProgramAddress([SEED_REGISTRY], programId);
  return pda;
};

const getVoterRegistryPda = async (voter: PublicKey) => {
  const [pda] = await PublicKey.findProgramAddress([SEED_VOTER_REGISTRY, voter.toBuffer()], programId);
  return pda;
};

function App() {
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [connected, setConnected] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [page, setPage] = useState<"home" | "activePolls" | "endedPolls" | "createPoll" | "pollDetail" | "myCreatedPolls" | "myVotedPolls">("home");
  const [pollIds, setPollIds] = useState<number[]>([]);
  const [polls, setPolls] = useState<PollData[]>([]);
  const [votedPollIds, setVotedPollIds] = useState<number[]>([]);
  const [selectedPoll, setSelectedPoll] = useState<PollData | null>(null);
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [myVoteRecordForPoll] = useState<VoteRecordData | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [newPollName, setNewPollName] = useState("");
  const [newPollDesc, setNewPollDesc] = useState("");
  const [newPollStart, setNewPollStart] = useState("");
  const [newPollEnd, setNewPollEnd] = useState("");
  const [newCandidateName, setNewCandidateName] = useState("");
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [showAddApprovedVoter, setShowAddApprovedVoter] = useState(false);
  const [newApprovedVoterAddr, setNewApprovedVoterAddr] = useState("");
  const [previousListPage, setPreviousListPage] = useState<"activePolls" | "endedPolls" | "myCreatedPolls" | "myVotedPolls">("activePolls");

  // ---- Wallet Auto‑reconnect ----
  useEffect(() => {
    const p = (window as any).phantom?.solana;
    if (p?.isPhantom) {
      p.connect({ onlyIfTrusted: true })
        .then((resp: any) => {
          const pk = new PublicKey(resp.publicKey.toString());
          setPublicKey(pk); setConnected(true); getBalance(pk);
        })
        .catch(() => { });
    }
  }, []);

  const getBalance = useCallback(async (pk: PublicKey) => {
    for (const rpc of rpcList) {
      try {
        const conn = new Connection(rpc, "confirmed");
        const bal = await conn.getBalance(pk);
        setBalance(bal / LAMPORTS_PER_SOL);
        return;
      } catch (err) { }
    }
  }, []);

  const connect = useCallback(async () => {
    const p = (window as any).phantom?.solana;
    if (!p?.isPhantom) { toast('error', 'Phantom not found'); return; }
    try {
      if (p.publicKey) {
        const pk = new PublicKey(p.publicKey.toString());
        setPublicKey(pk); setConnected(true); getBalance(pk);
        return;
      }
      const resp = await p.connect();
      const pk = new PublicKey(resp.publicKey.toString());
      setPublicKey(pk); setConnected(true); getBalance(pk);
    } catch (e: any) { toast('error', e.message); }
  }, [getBalance]);

  const disconnect = useCallback(async () => {
    const p = (window as any).phantom?.solana;
    if (p) { await p.disconnect(); setPublicKey(null); setConnected(false); setBalance(null); }
  }, []);

  useEffect(() => {
    const p = (window as any).phantom?.solana;
    if (p) p.on("accountChanged", async (pk: PublicKey | null) => {
      if (pk) { const k = new PublicKey(pk.toString()); setPublicKey(k); setConnected(true); getBalance(k); }
      else { setPublicKey(null); setConnected(false); setBalance(null); }
    });
  }, [getBalance]);

  // ---- On‑chain Data Fetches ----
  const ensureRegistry = useCallback(async () => {
    if (!publicKey) return;
    const registryPda = await getRegistryPda();
    for (const rpc of rpcList) {
      try { const conn = new Connection(rpc, "confirmed"); const acc = await conn.getAccountInfo(registryPda); if (acc) return; break; }
      catch { }
    }
    const initIx = new TransactionInstruction({
      keys: [{ pubkey: registryPda, isSigner: false, isWritable: true }, { pubkey: publicKey, isSigner: true, isWritable: true }, { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }],
      programId, data: await buildInstructionData("initialize_registry", {}, {}) as any,
    });
    try { await sendTx(initIx); toast('info', 'Registry initialized'); } catch (e: any) { }
  }, [publicKey]);

  const fetchPollIds = useCallback(async () => {
    const registryPda = await getRegistryPda();
    for (const rpc of rpcList) {
      try {
        const conn = new Connection(rpc, "confirmed"); const acc = await conn.getAccountInfo(registryPda);
        if (!acc) continue; const data = new Uint8Array(acc.data);
        if (data.length < 12) { setPollIds([]); return; }
        const vecLen = Number(new Uint32Array(data.slice(8, 12).buffer)[0]); const ids: number[] = [];
        for (let i = 0; i < vecLen; i++) { const offset = 12 + i * 8; ids.push(Number(new DataView(data.buffer, offset, 8).getBigUint64(0, true))); }
        setPollIds(ids); return;
      } catch { }
    }
  }, []);

  const fetchPolls = useCallback(async () => {
    if (pollIds.length === 0) { setPolls([]); return; }
    const pollPdas = await Promise.all(pollIds.map(async (id) => { const [pda] = await PublicKey.findProgramAddress([toLEBytes(id, 8)], programId); return pda; }));
    for (const rpc of rpcList) {
      try {
        const conn = new Connection(rpc, "confirmed"); const accounts = await conn.getMultipleAccountsInfo(pollPdas);
        if (!accounts) continue;
        const parsed = accounts.map((acc, idx) => acc ? parsePoll(pollPdas[idx], { data: new Uint8Array(acc.data) }) : null).filter((p): p is PollData => p !== null);
        setPolls(parsed); return;
      } catch { }
    }
  }, [pollIds]);

  const fetchCandidates = useCallback(async (poll: PollData) => {
    if (!poll.candidateIds || poll.candidateIds.length === 0) { setCandidates([]); return; }
    const candidatePdas = await Promise.all(poll.candidateIds.map(async (cid) => { const [pda] = await PublicKey.findProgramAddress([toLEBytes(poll.pollId, 8), toLEBytes(cid, 8)], programId); return pda; }));
    for (const rpc of rpcList) {
      try {
        const conn = new Connection(rpc, "confirmed"); const accounts = await conn.getMultipleAccountsInfo(candidatePdas);
        if (!accounts) continue;
        const parsed = accounts.map((acc, idx) => acc ? parseCandidate(candidatePdas[idx], { data: new Uint8Array(acc.data) }) : null).filter((c): c is CandidateData => c !== null);
        setCandidates(parsed); return;
      } catch { }
    }
  }, []);

  const fetchVotedPollIds = useCallback(async () => {
    if (!publicKey) return;
    const voterRegistryPda = await getVoterRegistryPda(publicKey);
    for (const rpc of rpcList) {
      try {
        const conn = new Connection(rpc, "confirmed"); const acc = await conn.getAccountInfo(voterRegistryPda);
        if (!acc) { setVotedPollIds([]); return; } const data = new Uint8Array(acc.data);
        if (data.length < 12) { setVotedPollIds([]); return; }
        const vecLen = Number(new Uint32Array(data.slice(8, 12).buffer)[0]); const ids: number[] = [];
        for (let i = 0; i < vecLen; i++) { const offset = 12 + i * 8; ids.push(Number(new DataView(data.buffer, offset, 8).getBigUint64(0, true))); }
        setVotedPollIds(ids); return;
      } catch { }
    }
    setVotedPollIds([]);
  }, [publicKey]);

  const checkApproved = useCallback(async (pollId: number) => {
    if (!publicKey) { setIsApproved(false); return; }
    const [pda] = await PublicKey.findProgramAddress([SEED_VOTER, toLEBytes(pollId, 8), publicKey.toBuffer()], programId);
    for (const rpc of rpcList) {
      try { const conn = new Connection(rpc, "confirmed"); const ai = await conn.getAccountInfo(pda); setIsApproved(!!ai); return; } catch (err) { }
    }
    setIsApproved(false);
  }, [publicKey]);

  useEffect(() => { if (connected && publicKey) { ensureRegistry().then(() => { fetchPollIds(); fetchVotedPollIds(); }); } }, [connected, publicKey, ensureRegistry, fetchPollIds, fetchVotedPollIds]);
  useEffect(() => { fetchPolls(); const interval = setInterval(fetchPolls, 15000); return () => clearInterval(interval); }, [fetchPolls]);
  useEffect(() => { if (selectedPoll) { fetchCandidates(selectedPoll); checkApproved(selectedPoll.pollId); const interval = setInterval(() => { fetchCandidates(selectedPoll); checkApproved(selectedPoll.pollId); }, 15000); return () => clearInterval(interval); } }, [selectedPoll, fetchCandidates, checkApproved]);

  // ---- Transaction Sender ----
  const sendTx = async (ix: TransactionInstruction) => {
    const p = (window as any).phantom?.solana;
    if (!p || !publicKey) throw new Error("Wallet not connected");
    const tx = new Transaction().add(ix); tx.feePayer = publicKey;
    let blockhash: { blockhash: string; lastValidBlockHeight: number } | null = null; let workingRpc: string | null = null;
    for (const rpc of rpcList) { try { const conn = new Connection(rpc, "confirmed"); const latest = await conn.getLatestBlockhash(); blockhash = latest; workingRpc = rpc; break; } catch (err) { console.warn(`RPC ${rpc} failed for blockhash`); } }
    if (!blockhash || !workingRpc) throw new Error("Could not get blockhash");
    tx.recentBlockhash = blockhash.blockhash; const signed = await p.signTransaction(tx);
    for (const rpc of [workingRpc, ...rpcList.filter(r => r !== workingRpc)]) {
      try { const conn = new Connection(rpc, "confirmed"); const sig = await conn.sendRawTransaction(signed.serialize()); await conn.confirmTransaction({ blockhash: blockhash.blockhash, lastValidBlockHeight: blockhash.lastValidBlockHeight, signature: sig }); return sig; } catch (err) { console.warn(`RPC ${rpc} failed to send/confirm`); }
    }
    throw new Error("Failed to send transaction");
  };

  // ---- Handlers ----
  const handleCreatePoll = async () => { /* ... same logic ... */ };
  const handleAddOption = async () => { /* ... updated logic with immediate refetch ... */ };
  const handleAddApprovedVoter = async () => { /* ... same ... */ };
  const handleVote = async (candidateId: number) => { /* ... same, plus fetchVotedPollIds call ... */ };
  const handleDeletePoll = async () => { /* ... same ... */ };

  const now = Math.floor(Date.now() / 1000);
  const activePolls = polls.filter(p => now >= p.startTime && now <= p.endTime);
  const endedPolls = polls.filter(p => p.endTime < now);
  const myCreatedPolls = publicKey ? polls.filter(p => p.authority.equals(publicKey)) : [];
  const myVotedPolls = polls.filter(p => votedPollIds.includes(p.pollId));

  return (
    <>
      <style>{`html,body{margin:0;padding:0;overflow-x:hidden}`}</style>
      <div style={{ margin: 0, padding: 0, minHeight: "100vh", background: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)", fontFamily: "'Segoe UI',sans-serif", color: "white" }}>
        <ToastContainer />
        <Navbar connected={connected} publicKey={publicKey} balance={balance} onConnect={connect} onDisconnect={disconnect} onHome={() => setPage("home")} />
        {page === "home" && <HomePage onActivePolls={() => setPage("activePolls")} onEndedPolls={() => setPage("endedPolls")} onCreatePoll={() => { if (!connected) { toast('info', 'Connect wallet first'); return; } setPage("createPoll"); }} onMyCreatedPolls={() => setPage("myCreatedPolls")} onMyVotedPolls={() => setPage("myVotedPolls")} connected={connected} />}
        {page === "activePolls" && <PollList polls={activePolls} title="Active Polls" onPollClick={(poll) => { setSelectedPoll(poll); setPreviousListPage("activePolls"); setPage("pollDetail"); }} onBack={() => setPage("home")} />}
        {page === "endedPolls" && <PollList polls={endedPolls} title="Ended Polls" onPollClick={(poll) => { setSelectedPoll(poll); setPreviousListPage("endedPolls"); setPage("pollDetail"); }} onBack={() => setPage("home")} />}
        {page === "myCreatedPolls" && <PollList polls={myCreatedPolls} title="My Created Polls" onPollClick={(poll) => { setSelectedPoll(poll); setPreviousListPage("myCreatedPolls"); setPage("pollDetail"); }} onBack={() => setPage("home")} />}
        {page === "myVotedPolls" && <PollList polls={myVotedPolls} title="My Voted Polls" onPollClick={(poll) => { setSelectedPoll(poll); setPreviousListPage("myVotedPolls"); setPage("pollDetail"); }} onBack={() => setPage("home")} />}
        {page === "pollDetail" && selectedPoll && (
          <PollDetailPage
            poll={selectedPoll} candidates={candidates}
            myVoteRecord={myVoteRecordForPoll} isApproved={isApproved} isActive={now >= selectedPoll.startTime && now <= selectedPoll.endTime}
            onBack={() => setPage(previousListPage)} onVote={handleVote}
            onAddCandidate={() => setShowAddCandidate(!showAddCandidate)} showAddCandidate={showAddCandidate} newCandidateName={newCandidateName}
            onNewCandidateNameChange={setNewCandidateName} onSubmitCandidate={handleAddOption}
            isAuthority={!!(connected && publicKey && selectedPoll.authority.equals(publicKey))}
            onAddApprovedVoter={() => setShowAddApprovedVoter(!showAddApprovedVoter)} showAddApprovedVoter={showAddApprovedVoter}
            newApprovedVoterAddr={newApprovedVoterAddr} onNewApprovedVoterAddrChange={setNewApprovedVoterAddr}
            onSubmitApprovedVoter={handleAddApprovedVoter} connected={connected} publicKey={publicKey} onDeletePoll={handleDeletePoll}
          />
        )}
        {page === "createPoll" && <CreatePollPage newPollName={newPollName} newPollDesc={newPollDesc} newPollStart={newPollStart} newPollEnd={newPollEnd} onNameChange={setNewPollName} onDescChange={setNewPollDesc} onStartChange={setNewPollStart} onEndChange={setNewPollEnd} onSubmit={handleCreatePoll} onCancel={() => setPage("home")} />}
      </div>
    </>
  );
}

export default App;