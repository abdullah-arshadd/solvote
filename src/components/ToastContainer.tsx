import React, { useState, useEffect } from "react";
import { ToastData } from "../utils/types";

let _setToasts: any = null;
export function toast(type: 'success' | 'error' | 'info', msg: string) {
  if (_setToasts) {
    const t = { id: Date.now(), type, message: msg };
    _setToasts((prev: ToastData[]) => [...prev, t]);
    setTimeout(() => { if (_setToasts) _setToasts((prev: ToastData[]) => prev.filter(x => x.id !== t.id)); }, 3000);
  }
}

const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  useEffect(() => { _setToasts = setToasts; return () => { _setToasts = null; }; }, []);
  return (
    <div style={{ position: "fixed", bottom: 20, left: 20, zIndex: 9999 }}>
      {toasts.map(t => (<div key={t.id} style={{
        margin: "10px 0", padding: "15px 20px", borderRadius: "8px",
        background: t.type === 'success' ? '#00b894' : t.type === 'error' ? '#d63031' : '#0984e3',
        color: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
      }}>{t.message}</div>))}
    </div>
  );
};

export default ToastContainer;