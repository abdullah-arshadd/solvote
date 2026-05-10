import React from "react";
import { btnStyle } from "./styles";

const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} style={{ ...btnStyle, padding: "8px 16px", minWidth: "auto", opacity: currentPage === 1 ? 0.5 : 1 }}>← Prev</button>
      {pages.map(p => (
        <button key={p} onClick={() => onPageChange(p)}
          style={{ ...btnStyle, padding: "8px 16px", minWidth: "auto", background: p === currentPage ? "linear-gradient(135deg, #a855f7, #3b82f6)" : "rgba(255,255,255,0.1)", border: p === currentPage ? "none" : "1px solid rgba(255,255,255,0.2)" }}>{p}</button>
      ))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} style={{ ...btnStyle, padding: "8px 16px", minWidth: "auto", opacity: currentPage === totalPages ? 0.5 : 1 }}>Next →</button>
    </div>
  );
};

export default Pagination;