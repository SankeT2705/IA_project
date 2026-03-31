import { useState } from "react";

export default function Navbar({ setPage, currentPage }) {
  const [active, setActive] = useState("dashboard");

  const handleClick = (page) => {
    setActive(page);
    setPage(page);
  };

  const navItems = [
    { id: "dashboard", label: "Overview", icon: "⬡" },
    { id: "tasks",     label: "Tasks",    icon: "≡" },
  ];

  return (
    <header style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      height: "56px",
      background: "#0d1117",
      borderBottom: "1px solid rgba(255,255,255,0.07)",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: "28px", height: "28px",
          background: "linear-gradient(135deg, #00d68f, #0ea5e9)",
          borderRadius: "6px",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "14px"
        }}>⚡</div>
        <span style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontWeight: 700,
          fontSize: "15px",
          color: "#e2e8f0",
          letterSpacing: "-0.01em"
        }}>Edge AI</span>
        <span style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontWeight: 300,
          fontSize: "15px",
          color: "#8892a4",
        }}>Control Center</span>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", gap: "4px" }}>
        {navItems.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => handleClick(id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: "13px",
              fontWeight: 500,
              transition: "all 0.15s ease",
              background: active === id ? "rgba(0,214,143,0.12)" : "transparent",
              color: active === id ? "#00d68f" : "#8892a4",
              borderBottom: active === id ? "2px solid #00d68f" : "2px solid transparent",
              borderRadius: "6px 6px 0 0",
            }}
          >
            <span style={{ fontSize: "12px" }}>{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      {/* Status */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span className="pulse pulse-green" />
          <span style={{ fontSize: "12px", color: "#8892a4", fontFamily: "'IBM Plex Mono', monospace" }}>
            All systems operational
          </span>
        </div>
        <div style={{
          width: "30px", height: "30px",
          borderRadius: "50%",
          background: "#1c2333",
          border: "1px solid rgba(255,255,255,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "13px", cursor: "pointer"
        }}>👤</div>
      </div>
    </header>
  );
}