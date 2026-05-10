import React from "react";
import { PublicKey } from "@solana/web3.js";

const walletBtnStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #a855f7, #3b82f6)",
  border: "none",
  color: "white",
  fontWeight: 600,
  padding: "0.5rem 1.5rem",
  borderRadius: "9999px",
  cursor: "pointer",
  transition: "0.3s",
  position: "relative",
  overflow: "hidden",
};

const WalletButton: React.FC<{
  connected: boolean;
  publicKey: PublicKey | null;
  balance: number | null;
  onConnect: () => void;
  onDisconnect: () => void;
}> = ({ connected, publicKey, balance, onConnect, onDisconnect }) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      {connected && balance !== null && (
        <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem" }}>
          {balance.toFixed(4)} SOL
        </span>
      )}
      {connected ? (
        <button onClick={onDisconnect} style={walletBtnStyle}>
          <span style={{ position: "relative", zIndex: 10 }}>
            {publicKey?.toBase58().slice(0, 6)}...
          </span>
          <span className="shine" />
        </button>
      ) : (
        <button onClick={onConnect} style={walletBtnStyle}>
          <span style={{ position: "relative", zIndex: 10 }}>
            Connect Wallet
          </span>
          <span className="shine" />
        </button>
      )}
    </div>
  );
};

export default WalletButton;