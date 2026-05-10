import { PublicKey } from "@solana/web3.js";

export interface PollData {
  pubkey: PublicKey;
  pollId: number;
  name: string;
  description: string;
  startTime: number;
  endTime: number;
  authority: PublicKey;
  candidatesCount: number;
  approvedVotersCount: number;
  candidateIds: number[];
}

export interface CandidateData {
  pubkey: PublicKey;
  pollId: number;
  candidateId: number;
  name: string;
  voteCount: number;
}

export interface VoteRecordData {
  pubkey: PublicKey;
  voter: PublicKey;
  pollId: number;
  candidateId: number;
}

export interface ToastData {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}