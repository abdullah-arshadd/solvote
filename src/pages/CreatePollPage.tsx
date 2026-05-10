import React from "react";
import { btnStyle, pollCardStyle, inputStyle } from "../components/styles";

const CreatePollPage: React.FC<{
  newPollName: string; newPollDesc: string;
  newPollStart: string; newPollEnd: string;
  onNameChange: (v: string) => void; onDescChange: (v: string) => void;
  onStartChange: (v: string) => void; onEndChange: (v: string) => void;
  onSubmit: () => void; onCancel: () => void;
}> = ({ newPollName, newPollDesc, newPollStart, newPollEnd, onNameChange, onDescChange, onStartChange, onEndChange, onSubmit, onCancel }) => (
  <div style={{ maxWidth: 600, margin: "0 auto", padding: "100px 20px 40px" }}>
    <h2 style={{ color: "white", fontSize: "2rem", marginBottom: "2rem" }}>Create New Poll</h2>
    <div style={pollCardStyle}>
      <input placeholder="Poll Name" value={newPollName} onChange={e => onNameChange(e.target.value)} style={inputStyle} />
      <input placeholder="Description" value={newPollDesc} onChange={e => onDescChange(e.target.value)} style={inputStyle} />
      <input type="datetime-local" value={newPollStart} onChange={e => onStartChange(e.target.value)} style={inputStyle} />
      <input type="datetime-local" value={newPollEnd} onChange={e => onEndChange(e.target.value)} style={inputStyle} />
      <div style={{ display: "flex", gap: "1rem", marginTop: "20px", flexWrap: "wrap" }}>
        <button onClick={onSubmit} style={{ ...btnStyle, background: "linear-gradient(135deg,#6c5ce7,#a29bfe)", flex: 1 }}>Create Poll</button>
        <button onClick={onCancel} style={{ ...btnStyle, background: "#636e72", flex: 1 }}>Cancel</button>
      </div>
    </div>
  </div>
);

export default CreatePollPage;