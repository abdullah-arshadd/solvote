import React, { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import WalletButton from "./WalletButton";

const Navbar: React.FC<{
  connected: boolean;
  publicKey: PublicKey | null;
  balance: number | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onHome: () => void;
}> = ({ connected, publicKey, balance, onConnect, onDisconnect, onHome}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      padding: scrolled ? "0.75rem 0" : "1.5rem 0",
      background: scrolled ? "rgba(15,23,42,0.7)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.1)" : "none",
      boxShadow: scrolled ? "0 8px 32px rgba(0,0,0,0.37), 0 0 20px rgba(168,85,247,0.1)" : "none",
      transition: "all 0.5s ease"
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* Logo */}
        <div onClick={onHome} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: scrolled ? "2rem" : "2.5rem", height: scrolled ? "2rem" : "2.5rem",
            borderRadius: "0.75rem", background: "linear-gradient(135deg, rgba(168,85,247,0.8), rgba(59,130,246,0.8))",
            display: "flex", alignItems: "center", justifyContent: "center", transition: "0.3s"
          }}>
            <svg width={scrolled ? "20" : "24"} height={scrolled ? "20" : "24"} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span style={{ color: "white", fontWeight: "bold", fontSize: scrolled ? "1.125rem" : "1.25rem", transition: "0.3s" }}>SolVote</span>
        </div>

        {/* Wallet Button */}
        <WalletButton
          connected={connected}
          publicKey={publicKey}
          balance={balance}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
        />
      </div>
    </nav>
  );
};

export default Navbar;