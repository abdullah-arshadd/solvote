import React from "react";

export const btnStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #a855f7, #3b82f6)", border: "none", color: "white", fontWeight: 600,
  padding: "12px 24px", borderRadius: "9999px", cursor: "pointer", transition: "0.3s", fontSize: "1rem", minWidth: "150px"
};

export const pollCardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)", backdropFilter: "blur(15px)", borderRadius: "16px", padding: "20px",
  margin: "15px 0", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
};

export const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px", margin: "8px 0", borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.3)", color: "white", fontSize: "1rem",
  outline: "none", boxSizing: "border-box"
};