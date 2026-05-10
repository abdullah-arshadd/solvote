import React from "react";
import { btnStyle } from "../components/styles";
import { toast } from "../components/ToastContainer";

const HomePage: React.FC<{
  onActivePolls: () => void;
  onEndedPolls: () => void;
  onCreatePoll: () => void;
  onMyCreatedPolls: () => void;
  onMyVotedPolls: () => void;
  connected: boolean;
}> = ({ onActivePolls, onEndedPolls, onCreatePoll, onMyCreatedPolls, onMyVotedPolls, connected }) => (
  <div style={{ height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", paddingTop: "80px", boxSizing: "border-box", textAlign: "center", overflow: "hidden" }}>

    {/* SolVote Heading — White */}
    <h1 style={{
      fontSize: "clamp(2.5rem,8vw,5rem)",
      fontWeight: "bold",
      margin: "0 0 0.5rem 0",
      color: "#ffffff",
      lineHeight: 1.1
    }}>
      SolVote
    </h1>

    {/* Subtitle */}
    <p style={{
      fontSize: "clamp(1rem,4vw,1.3rem)",
      color: "rgba(255,255,255,0.7)",
      maxWidth: "600px",
      margin: "0 0 2rem 0",
      padding: "0 20px",
      lineHeight: 1.5
    }}>
      Decentralized Vote System Based on Solana Technology
    </p>

    {/* Buttons */}
    <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center", padding: "0 20px" }}>
      <button onClick={onActivePolls} style={btnStyle}>Active Polls</button>
      <button onClick={onEndedPolls} style={btnStyle}>Ended Polls</button>
      {connected ? (<>
        <button onClick={onCreatePoll} style={{ ...btnStyle, background: "linear-gradient(135deg,#6c5ce7,#a29bfe)" }}>+ Create Poll</button>
        <button onClick={onMyCreatedPolls} style={{ ...btnStyle, background: "linear-gradient(135deg,#e17055,#fd79a8)" }}>My Created Polls</button>
        <button onClick={onMyVotedPolls} style={{ ...btnStyle, background: "linear-gradient(135deg,#00b894,#55efc4)" }}>My Voted Polls</button>
      </>) : (
        <button onClick={() => toast('info', "Connect wallet to create polls")} style={{ ...btnStyle, opacity: 0.7, cursor: "not-allowed" }}>+ Create Poll</button>
      )}
    </div>
    <p style={{
        color: "rgba(255,255,255,0.7)",
        fontSize: "20px"
    }}>
        Supported Wallet = Phantom
    </p>
  </div>
);

export default HomePage;