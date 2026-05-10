import { PublicKey } from "@solana/web3.js";

export const programId = new PublicKey("E8QxP2dT17SkxmP1ZQ4qJastqPjayoYGNpqVLE8krMNt");

export const rpcList = [
  "https://devnet.helius-rpc.com/?api-key=09f1733a-379e-4935-babb-8b674ebae5d8gi",
  "https://api.devnet.solana.com",
];

export const SEED_REGISTRY = new TextEncoder().encode("registry");
export const SEED_VOTER = new TextEncoder().encode("voter");
export const SEED_VOTE = new TextEncoder().encode("vote");
export const SEED_VOTER_REGISTRY = new TextEncoder().encode("voter_registry");

export const POLL_DISCRIMINATOR = new Uint8Array([136,227,56,31,51,113,9,12]);
export const CANDIDATE_DISCRIMINATOR = new Uint8Array([23,124,92,168,2,42,151,99]);
export const VOTE_RECORD_DISCRIMINATOR = new Uint8Array([162,96,200,17,213,80,23,167]);