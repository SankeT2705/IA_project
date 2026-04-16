import { useEffect, useState, useRef } from "react";
import axios from "axios";

function PreemptionAnimation({ event, onDone }) {
  const [phase, setPhase] = useState("evict");
  const nodeColors = { edge_1: "#22d3ee", edge_2: "#3b82f6", cloud: "#f59e0b" };
  const nodeColor = nodeColors[event.node] || "#8b5cf6";

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("transit"), 500);
    const t2 = setTimeout(() => setPhase("settle"),  1200);
    const t3 = setTimeout(() => { setPhase("done"); onDone(); }, 2000);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, []);

  return (
    <div style={{
      position: "relative",
      height: "44px",
      background: "rgba(245,158,11,0.05)",
      borderRadius: "8px",
      border: "1px solid rgba(245,158,11,0.18)",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      padding: "0 14px",
      gap: "10px",
    }}>
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        padding: "2px 8px",
        borderRadius: "4px",
        background: "rgba(239,68,68,0.12)",
        border: "1px solid rgba(239,68,68,0.25)",
        color: "var(--neon-red)",
        transform: phase === "evict" ? "scale(1)" : "scale(0.85) translateX(-6px)",
        opacity: phase === "settle" ? 0.35 : 1,
        transition: "all 0.45s ease",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}>
        ✗ {(event.old_task || "").slice(0, 10)}
      </div>

      <div style={{
        fontSize: "14px",
        color: "var(--neon-amber)",
        opacity: phase === "evict" ? 0 : 1,
        transition: "opacity 0.3s ease 0.3s",
        flexShrink: 0,
      }}>→</div>

      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        padding: "2px 8px",
        borderRadius: "4px",
        background: phase === "settle" ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${phase === "settle" ? "rgba(16,185,129,0.28)" : "rgba(255,255,255,0.08)"}`,
        color: phase === "settle" ? "var(--neon-green)" : "var(--text-secondary)",
        transform: phase === "settle" ? "scale(1.04)" : "scale(0.9)",
        transition: "all 0.4s ease 0.4s",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}>
        ✓ {(event.new_task || "").slice(0, 10)}
      </div>

      <div style={{
        marginLeft: "auto",
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
        padding: "2px 7px",
        borderRadius: "4px",
        background: `${nodeColor}14`,
        border: `1px solid ${nodeColor}30`,
        color: nodeColor,
        flexShrink: 0,
      }}>
        {event.node}
      </div>
    </div>
  );
}

export default function PreemptionPanel() {
  const [events,    setEvents]    = useState([]);
  const [animQueue, setAnimQueue] = useState([]);
  const [nodeStats, setNodeStats] = useState({});
  const [history,   setHistory]   = useState([]);
  const prevIds = useRef(new Set());

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/events");
        const data = Array.isArray(res.data) ? res.data : [];
        setEvents(data);

        // Detect new events
        const newOnes = data.filter(e => {
          const key = `${e.old_task}-${e.new_task}-${e.node}`;
          return !prevIds.current.has(key);
        });
        newOnes.forEach(e => {
          prevIds.current.add(`${e.old_task}-${e.new_task}-${e.node}`);
        });
        if (newOnes.length > 0) {
          setAnimQueue(prev => [
            ...prev,
            ...newOnes.map(e => ({
              ...e,
              animId: `${e.old_task}-${Date.now()}-${Math.random()}`,
            })),
          ].slice(-3));
        }

        // History
        setHistory(prev => [...prev.slice(-30), data.length]);

        // Per-node stats
        const stats = {};
        data.forEach(e => { stats[e.node] = (stats[e.node] || 0) + 1; });
        setNodeStats(stats);

      } catch { /* silent */ }
    };

    fetch();
    const t = setInterval(fetch, 2000);
    return () => clearInterval(t);
  }, []);

  const removeAnim = (id) => setAnimQueue(prev => prev.filter(e => e.animId !== id));

  const NODE_COLORS = { edge_1: "#22d3ee", edge_2: "#3b82f6", cloud: "#f59e0b" };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">⚡ Preemption Events</span>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {events.length > 0 && (
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "var(--text-muted)",
            }}>
              {events.length} total
            </span>
          )}
          <span className="badge badge-amber">
            <span className="pulse pulse-amber" />
            Live
          </span>
        </div>
      </div>

      {/* Per-node stats */}
      {Object.keys(nodeStats).length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${Object.keys(nodeStats).length}, 1fr)`,
          gap: "10px",
          marginBottom: "16px",
        }}>
          {Object.entries(nodeStats).map(([node, count]) => {
            const color = NODE_COLORS[node] || "#8b5cf6";
            return (
              <div key={node} style={{
                background: "var(--bg-surface)",
                border: `1px solid ${color}20`,
                borderRadius: "9px",
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}>
                <div style={{
                  width: "32px", height: "32px",
                  borderRadius: "8px",
                  background: `${color}14`,
                  border: `1px solid ${color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  color: color,
                  flexShrink: 0,
                }}>⚡</div>
                <div>
                  <div style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    lineHeight: 1,
                  }}>{count}</div>
                  <div style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    color: color,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginTop: "2px",
                  }}>{node}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Active animations */}
      {animQueue.length > 0 && (
        <div style={{ marginBottom: "14px" }}>
          <div style={{
            fontSize: "10px",
            fontFamily: "var(--font-mono)",
            color: "var(--neon-amber)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "8px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}>
            <span className="pulse pulse-amber" />
            Active preemptions
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {animQueue.map(e => (
              <PreemptionAnimation key={e.animId} event={e} onDone={() => removeAnim(e.animId)} />
            ))}
          </div>
        </div>
      )}

      {/* Event log */}
      {events.length === 0 ? (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100px",
          color: "var(--text-muted)",
          gap: "8px",
        }}>
          <div style={{ fontSize: "22px", opacity: 0.2 }}>⚡</div>
          <div style={{ fontSize: "13px" }}>No preemption events yet</div>
        </div>
      ) : (
        <>
          <div style={{
            fontSize: "10px",
            fontFamily: "var(--font-mono)",
            color: "var(--text-ghost)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "8px",
          }}>
            Event Log
          </div>
          <div style={{ maxHeight: "260px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "5px" }}>
            {[...events].reverse().map((e, i) => {
              const nc = NODE_COLORS[e.node] || "#8b5cf6";
              return (
                <div
                  key={i}
                  className="fade-in"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-faint)",
                    transition: "border-color 0.2s",
                    cursor: "default",
                  }}
                  onMouseEnter={ev => ev.currentTarget.style.borderColor = "var(--border-mid)"}
                  onMouseLeave={ev => ev.currentTarget.style.borderColor = "var(--border-faint)"}
                >
                  <div style={{
                    width: "24px", height: "24px",
                    borderRadius: "6px",
                    background: "rgba(245,158,11,0.10)",
                    border: "1px solid rgba(245,158,11,0.22)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "11px", color: "var(--neon-amber)",
                    flexShrink: 0,
                  }}>⇄</div>

                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: "11px",
                      color: "var(--neon-red)", background: "rgba(239,68,68,0.08)",
                      padding: "1px 6px", borderRadius: "3px", whiteSpace: "nowrap",
                    }}>
                      {(e.old_task || "").slice(0, 10)}
                    </span>
                    <span style={{ color: "var(--text-ghost)", fontSize: "11px" }}>→</span>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: "11px",
                      color: "var(--neon-green)", background: "rgba(16,185,129,0.08)",
                      padding: "1px 6px", borderRadius: "3px", whiteSpace: "nowrap",
                    }}>
                      {(e.new_task || "").slice(0, 10)}
                    </span>
                  </div>

                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: "10px",
                    padding: "2px 7px", borderRadius: "4px",
                    background: `${nc}12`, border: `1px solid ${nc}28`, color: nc,
                    flexShrink: 0,
                  }}>
                    {e.node}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}