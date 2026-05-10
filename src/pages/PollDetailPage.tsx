import React from "react";
import { PublicKey } from "@solana/web3.js";
import { PollData, CandidateData, VoteRecordData } from "../utils/types";
import { btnStyle, pollCardStyle, inputStyle } from "../components/styles";
import { toast } from "../components/ToastContainer";

const PollDetailPage: React.FC<{
  poll: PollData; candidates: CandidateData[]; myVoteRecord: VoteRecordData | null;
  isApproved: boolean; isActive: boolean;
  onBack: () => void; onVote: (cid: number) => void;
  onAddCandidate: () => void; showAddCandidate: boolean;
  newCandidateName: string; onNewCandidateNameChange: (n: string) => void;
  onSubmitCandidate: () => void; isAuthority: boolean;
  onAddApprovedVoter: () => void; showAddApprovedVoter: boolean;
  newApprovedVoterAddr: string; onNewApprovedVoterAddrChange: (a: string) => void;
  onSubmitApprovedVoter: () => void;
  connected: boolean; publicKey: PublicKey | null; onDeletePoll: () => void;
}> = ({ poll, candidates, myVoteRecord, isApproved, isActive, onBack, onVote,
  onAddCandidate, showAddCandidate, newCandidateName, onNewCandidateNameChange, onSubmitCandidate, isAuthority,
  onAddApprovedVoter, showAddApprovedVoter, newApprovedVoterAddr, onNewApprovedVoterAddrChange, onSubmitApprovedVoter,
  connected, publicKey, onDeletePoll }) => {
  const now = Math.floor(Date.now() / 1000);
  const notStarted = now < poll.startTime;
  const ended = now > poll.endTime;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "100px 20px 40px" }}>
      <button onClick={onBack} style={{ background: "transparent", border: "none", color: "#a855f7", fontSize: "1rem", cursor: "pointer", marginBottom: "20px" }}>← Back</button>
      <div style={pollCardStyle}>
        <h2 style={{ color: "white", fontSize: "2rem", margin: "0 0 1rem" }}>{poll.name}</h2>
        <p style={{ color: "rgba(255,255,255,0.7)" }}>{poll.description}</p>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>{new Date(poll.startTime * 1000).toLocaleString()} - {new Date(poll.endTime * 1000).toLocaleString()}</p>
        {notStarted && <p style={{ color: "#fdcb6e", marginTop: "0.5rem" }}>⏳ Voting has not started yet</p>}
        {ended && <p style={{ color: "#ff7675", marginTop: "0.5rem" }}>Poll has ended</p>}
        {isActive && <p style={{ color: "#00b894", marginTop: "0.5rem" }}>✅ Poll is active</p>}
        {connected && publicKey && (
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", marginTop: "0.5rem" }}>Connected: {publicKey.toBase58().slice(0, 6)}...{publicKey.toBase58().slice(-4)}</p>
        )}
        {isAuthority && (
          <button onClick={onDeletePoll} style={{ ...btnStyle, background: "#d63031", marginTop: "1rem", minWidth: "auto" }}>🗑️ Delete Poll</button>
        )}
      </div>

      <h3 style={{ color: "white", marginTop: "2rem", fontSize: "1.5rem" }}>Options</h3>
      {candidates.length === 0 && <p style={{ color: "rgba(255,255,255,0.6)" }}>No options yet.</p>}
      {candidates.map(c => {
        const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);
        const pct = totalVotes > 0 ? Math.round((c.voteCount / totalVotes) * 100) : 0;
        return (
          <div key={c.candidateId} style={{ ...pollCardStyle, padding: "15px 20px", margin: "10px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "0.5rem" }}>
              <span style={{ color: "white", fontSize: "1.1rem" }}>{c.name} ({c.voteCount} votes)</span>
              {isActive && !myVoteRecord ? (
                isApproved ? (
                  <button onClick={() => onVote(c.candidateId)} style={{ background: "#6c5ce7", border: "none", color: "white", padding: "8px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: 500 }}>Vote</button>
                ) : (
                  <button onClick={() => toast('info', 'You are not an approved voter for this poll.')} style={{ background: "#636e72", border: "none", color: "white", padding: "8px 20px", borderRadius: "8px", cursor: "not-allowed" }}>🔒 Not Approved</button>
                )
              ) : (
                myVoteRecord && <span style={{ color: "rgba(255,255,255,0.5)", fontStyle: "italic" }}>Already voted</span>
              )}
            </div>
            <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, #6c5ce7, #a29bfe)", borderRadius: "3px", transition: "width 0.3s ease" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>
              <span>{pct}%</span>
              <span>{c.voteCount} / {totalVotes}</span>
            </div>
          </div>
        );
      })}

      {isAuthority && isActive && (
        <>
          <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button onClick={onAddCandidate} style={{ ...btnStyle, background: "#6c5ce7", minWidth: "auto" }}>{showAddCandidate ? "Cancel" : "+ Add Option"}</button>
            <button onClick={onAddApprovedVoter} style={{ ...btnStyle, background: "#e17055", minWidth: "auto" }}>{showAddApprovedVoter ? "Cancel" : "+ Add Approved Voter"}</button>
          </div>
          {showAddCandidate && (
            <div style={{ ...pollCardStyle, marginTop: "1rem" }}>
              <input placeholder="Option name" value={newCandidateName} onChange={e => onNewCandidateNameChange(e.target.value)} style={inputStyle} />
              <button onClick={onSubmitCandidate} style={{ ...btnStyle, background: "#6c5ce7", marginTop: 10 }}>Submit</button>
            </div>
          )}
          {showAddApprovedVoter && (
            <div style={{ ...pollCardStyle, marginTop: "1rem" }}>
              <input placeholder="Approved Voter Wallet Address" value={newApprovedVoterAddr} onChange={e => onNewApprovedVoterAddrChange(e.target.value)} style={inputStyle} />
              <button onClick={onSubmitApprovedVoter} style={{ ...btnStyle, background: "#e17055", marginTop: 10 }}>Add Voter</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PollDetailPage;