import React, { useState } from "react";
import { PollData } from "../utils/types";
import PollCard from "../components/PollCard";
import Pagination from "../components/Pagination";

const PollList: React.FC<{
  polls: PollData[];
  title: string;
  onPollClick: (p: PollData) => void;
  onBack: () => void;
}> = ({ polls, title, onPollClick, onBack }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(polls.length / itemsPerPage);
  const displayed = polls.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "100px 20px 40px" }}>
      <button onClick={onBack} style={{ background: "transparent", border: "none", color: "#a855f7", fontSize: "1rem", cursor: "pointer", marginBottom: "20px" }}>← Back</button>
      <h2 style={{ color: "white", fontSize: "2rem", marginBottom: "2rem" }}>{title}</h2>
      {polls.length === 0 && <p style={{ color: "rgba(255,255,255,0.6)" }}>No polls to display.</p>}
      {displayed.map(p => <PollCard key={p.pollId} poll={p} onClick={() => onPollClick(p)} />)}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
};

export default PollList;