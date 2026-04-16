import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/",       label: "Overview",   icon: "◈" },
  { path: "/tasks",  label: "Tasks",      icon: "≡" },
  { path: "/nodes",  label: "Nodes",      icon: "⬡" },
  { path: "/rl",     label: "RL Agent",   icon: "◎" },
];

export default function Navbar({ systemStatus = "online" }) {
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const statusColor = {
    online:   "var(--neon-green)",
    degraded: "var(--neon-amber)",
    offline:  "var(--neon-red)",
  }[systemStatus] || "var(--neon-green)";

  return (
    <nav style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 32px",
      height: "56px",
      background: "rgba(9,13,26,0.92)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(120,160,255,0.08)",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "30px", height: "30px",
          borderRadius: "8px",
          background: "linear-gradient(135deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3))",
          border: "1px solid rgba(120,160,255,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
        }}>⬡</div>

        <div>
          <div style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 700,
            fontSize: "14px",
            color: "var(--text-primary)",
            letterSpacing: "0.03em",
          }}>
            EdgeAI<span style={{ color: "var(--neon-blue)", opacity: 0.8 }}>.io</span>
          </div>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: "9px",
            color: "var(--text-muted)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}>
            Adaptive Resource Allocator
          </div>
        </div>
      </div>

      {/* Nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 14px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 500,
              fontFamily: "var(--font-sans)",
              letterSpacing: "0.02em",
              textDecoration: "none",
              transition: "all 0.15s ease",
              background: isActive ? "rgba(59,130,246,0.12)" : "transparent",
              color: isActive ? "var(--neon-blue)" : "var(--text-secondary)",
              border: isActive ? "1px solid rgba(59,130,246,0.22)" : "1px solid transparent",
            })}
          >
            <span style={{ fontSize: "12px" }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {/* System status */}
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <span className="pulse pulse-green" style={{ background: statusColor }} />
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: statusColor,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}>
            {systemStatus}
          </span>
        </div>

        {/* Clock */}
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          color: "var(--text-muted)",
          letterSpacing: "0.05em",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-dim)",
          padding: "4px 12px",
          borderRadius: "5px",
        }}>
          {clock.toLocaleTimeString([], { hour12: false })}
        </div>
      </div>
    </nav>
  );
}