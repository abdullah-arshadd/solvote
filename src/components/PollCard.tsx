import React, { useState, useEffect } from "react";
import { PollData } from "../utils/types";
import { pollCardStyle } from "./styles";

const PollCard: React.FC<{ poll: PollData; onClick: () => void }> = ({ poll, onClick }) => {
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  useEffect(() => {
    const i = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(i);
  }, []);
  const active = now >= poll.startTime && now <= poll.endTime;
  const left = poll.endTime - now, ago = now - poll.endTime;
  const fmt = (s: number) => {
    if (s <= 0) return "Ended";
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600),
          m = Math.floor((s % 3600) / 60), sec = s % 60;
    if (d) return `${d}d ${h}h`; if (h) return `${h}h ${m}m`; if (m) return `${m}m ${sec}s`; return `${sec}s`;
  };

  return (
    <div onClick={onClick} style={{ ...pollCardStyle, cursor: "pointer" }}>
      <h3 style={{ color: "white", margin: "0 0 0.5rem" }}>{poll.name}</h3>
      <p style={{ color: "rgba(255,255,255,0.6)", margin: "0 0 0.5rem" }}>{poll.description.slice(0, 100)}...</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
        <span style={{ background: active ? "#00b894" : "#636e72", padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", color: "white" }}>{active ? "Active" : "Ended"}</span>
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>{active ? `⏳ ${fmt(left)} left` : `Ended ${fmt(ago)} ago`}</span>
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>{poll.candidatesCount} opt. · {poll.approvedVotersCount} approved</span>
      </div>
    </div>
  );
};

export default PollCard;