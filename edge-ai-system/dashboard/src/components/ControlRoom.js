import { useEffect, useState } from "react";

function MiniSparkline({ values = [], color }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const w = 64, h = 24;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - (v / max) * h * 0.85 - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  return (
    <svg width={w} height={h} style={{ display: "block", overflow: "visible" }}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.75"
      />
    </svg>
  );
}

export default function ControlRoom({ nodes = {}, prevNodes = {} }) {
  const [loadHistory, setLoadHistory] = useState({});

  // Track load history per node for sparklines
  useEffect(() => {
    if (Object.keys(nodes).length === 0) return;
    setLoadHistory(prev => {
      const next = { ...prev };
      Object.entries(nodes).forEach(([id, node]) => {
        const load = (node.running || 0) + (node.queue || 0);
        next[id] = [...(prev[id] || []).slice(-12), load];
      });
      return next;
    });
  }, [nodes]);

  const getStatus = (load) => {
    if (load < 2) return { label: "Healthy",  cls: "healthy",  color: "var(--neon-green)", badge: "badge-green" };
    if (load < 4) return { label: "Warning",  cls: "warning",  color: "var(--neon-amber)", badge: "badge-amber" };
    return           { label: "Critical", cls: "critical", color: "var(--neon-red)",   badge: "badge-red"   };
  };

  const getNodeIcon = (id) => {
    if (id.includes("cloud")) return "☁";
    if (id.includes("edge"))  return "◈";
    if (id.includes("iot"))   return "⬡";
    return "◉";
  };

  const getHeatBg = (load) => {
    if (load < 2) return "rgba(16,185,129,0.05)";
    if (load < 4) return "rgba(245,158,11,0.07)";
    return "rgba(239,68,68,0.08)";
  };

  const entries = Object.entries(nodes);

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">
          ◈ Node Status
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>
            {entries.length} nodes
          </span>
          <span className="badge badge-green">
            <span className="pulse pulse-green" />
            Live
          </span>
        </div>
      </div>

      {entries.length === 0 ? (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "160px",
          color: "var(--text-muted)",
          gap: "10px",
        }}>
          <div style={{ fontSize: "28px", opacity: 0.3 }}>◈</div>
          <div style={{ fontSize: "13px" }}>Waiting for node data…</div>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
          gap: "12px",
        }}>
          {entries.map(([id, node]) => {
            const load    = (node.running || 0) + (node.queue || 0);
            const status  = getStatus(load);
            const pct     = Math.min(load * 20, 100);
            const trustPct = Math.round((node.trust || 0) * 100);
            const isNew   = !prevNodes[id];
            const history = loadHistory[id] || [];

            return (
              <div
                key={id}
                className={`node-card ${status.cls}${isNew ? " fade-in" : ""}`}
                style={{ background: getHeatBg(load) }}
              >
                {/* Header row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                  <div>
                    <div style={{
                      fontSize: "20px",
                      marginBottom: "5px",
                      filter: `drop-shadow(0 0 4px ${status.color}66)`,
                    }}>
                      {getNodeIcon(id)}
                    </div>
                    <div style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}>
                      {id.replace(/_/g, " ")}
                    </div>
                  </div>
                  <span className={`badge ${status.badge}`}>{status.label}</span>
                </div>

                {/* Running / Queue */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px" }}>
                  <div>
                    <div style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "22px",
                      fontWeight: 700,
                      color: "var(--neon-green)",
                      lineHeight: 1,
                    }}>
                      {node.running || 0}
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "2px" }}>
                      Running
                    </div>
                  </div>
                  <div>
                    <div style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "22px",
                      fontWeight: 700,
                      color: "var(--neon-amber)",
                      lineHeight: 1,
                    }}>
                      {node.queue || 0}
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "2px" }}>
                      Queued
                    </div>
                  </div>
                </div>

                {/* Sparkline */}
                {history.length >= 2 && (
                  <div style={{ marginBottom: "12px" }}>
                    <MiniSparkline values={history} color={status.color} />
                  </div>
                )}

                {/* Load bar */}
                <div style={{ marginBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Load</span>
                    <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: status.color }}>
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${status.color}55, ${status.color})`,
                    }} />
                  </div>
                </div>

                {/* Trust bar */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Trust</span>
                    <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--neon-violet)" }}>
                      {trustPct}%
                    </span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{
                      width: `${trustPct}%`,
                      background: "linear-gradient(90deg, rgba(139,92,246,0.4), var(--neon-violet))",
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}