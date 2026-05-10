import { PublicKey } from "@solana/web3.js";
import { PollData, CandidateData, VoteRecordData } from "./types";

function rU64(d: Uint8Array, o: number) { return Number(new DataView(d.buffer, o, 8).getBigUint64(0, true)); }
function rI64(d: Uint8Array, o: number) { return Number(new DataView(d.buffer, o, 8).getBigInt64(0, true)); }
function rPubkey(d: Uint8Array, o: number) { return new PublicKey(d.slice(o, o + 32)); }
function rString(d: Uint8Array, o: number): { str: string; len: number } {
  const len = Number(new Uint32Array(d.slice(o, o + 4).buffer)[0]);
  return { str: new TextDecoder().decode(d.slice(o + 4, o + 4 + len)), len: 4 + len };
}

export function parsePoll(pubkey: PublicKey, acc: { data: Uint8Array }): PollData | null {
  try {
    const d = acc.data;
    let o = 8;
    const pollId = rU64(d, o); o += 8;
    const { str: name, len: nl } = rString(d, o); o += nl;
    const { str: desc, len: dl } = rString(d, o); o += dl;
    const startTime = rI64(d, o); o += 8;
    const endTime = rI64(d, o); o += 8;
    const authority = rPubkey(d, o); o += 32;
    const candidatesCount = rU64(d, o); o += 8;
    const approvedVotersCount = (d.length >= o + 8) ? rU64(d, o) : 0;
    o += 8;
    const vecLen = Number(new Uint32Array(d.slice(o, o + 4).buffer)[0]);
    o += 4;
    const candidateIds: number[] = [];
    for (let i = 0; i < vecLen; i++) { candidateIds.push(rU64(d, o)); o += 8; }
    return { pubkey, pollId, name, description: desc, startTime, endTime, authority, candidatesCount, approvedVotersCount, candidateIds };
  } catch { return null; }
}

export function parseCandidate(pubkey: PublicKey, acc: { data: Uint8Array }): CandidateData | null {
  try {
    const d = acc.data;
    let o = 8;
    const pollId = rU64(d, o); o += 8;
    const candidateId = rU64(d, o); o += 8;
    const { str: name, len } = rString(d, o); o += len;
    const voteCount = rU64(d, o);
    return { pubkey, pollId, candidateId, name, voteCount };
  } catch { return null; }
}

export function parseVoteRecord(pubkey: PublicKey, acc: { data: Uint8Array }): VoteRecordData | null {
  try {
    const d = acc.data;
    let o = 8;
    const voter = rPubkey(d, o); o += 32;
    const pollId = rU64(d, o); o += 8;
    const candidateId = rU64(d, o);
    return { pubkey, voter, pollId, candidateId };
  } catch { return null; }
}