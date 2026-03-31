import { useEffect, useState, useRef } from "react";
import axios from "axios";

// ── Animated swap visualization ──────────────────────────────────────────────
function PreemptionAnimation({ event, onDone }) {
  const [phase, setPhase] = useState("evict"); // evict → transit → settle → done

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("transit"), 600);
    const t2 = setTimeout(() => setPhase("settle"),  1300);
    const t3 = setTimeout(() => { setPhase("done"); onDone(); }, 2200);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, []);

  const nodeColor = { edge_1: "#00d68f", edge_2: "#0ea5e9", cloud: "#f59e0b" }[event.node] || "#a78bfa";

  return (
    <div style={{
      position: "relative",
      height: "48px",
      background: "rgba(249,115,22,0.05)",
      borderRadius: "8px",
      border: "1px solid rgba(249,115,22,0.2)",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      padding: "0 14px",
      gap: "10px",
    }}>
      {/* Shimmer sweep */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(90deg, transparent, rgba(249,115,22,0.08), transparent)",
        transform: phase === "transit" ? "translateX(100%)" : "translateX(-100%)",
        transition: "transform 0.7s ease",
      }} />

      {/* Old task chip */}
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "12px",
        padding: "3px 10px",
        borderRadius: "5px",
        background: "rgba(244,63,94,0.15)",
        border: "1px solid rgba(244,63,94,0.3)",
        color: "#f43f5e",
        transform: phase === "evict" ? "scale(1)" : phase === "transit" ? "scale(0.85) translateX(-8px)" : "scale(0.75) translateX(-12px)",
        opacity: phase === "settle" || phase === "done" ? 0.4 : 1,
        transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)",
        whiteSpace: "nowrap",
      }}>
        ✗ {event.old_task.slice(0, 8)}
      </div>

      {/* Arrow */}
      <div style={{
        fontSize: "16px",
        color: "#f97316",
        opacity: phase === "evict" ? 0 : 1,
        transform: phase === "evict" ? "scaleX(0)" : "scaleX(1)",
        transition: "all 0.35s ease 0.4s",
        flexShrink: 0,
      }}>→</div>

      {/* New task chip */}
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "12px",
        padding: "3px 10px",
        borderRadius: "5px",
        background: phase === "settle" || phase === "done"
          ? "rgba(0,214,143,0.15)"
          : "rgba(255,255,255,0.05)",
        border: `1px solid ${phase === "settle" || phase === "done" ? "rgba(0,214,143,0.35)" : "rgba(255,255,255,0.1)"}`,
        color: phase === "settle" || phase === "done" ? "#00d68f" : "#8892a4",
        transform: phase === "settle" || phase === "done" ? "scale(1.05)" : "scale(0.9)",
        transition: "all 0.45s cubic-bezier(0.4,0,0.2,1) 0.5s",
        whiteSpace: "nowrap",
      }}>
        ✓ {event.new_task.slice(0, 8)}
      </div>

      {/* Node badge */}
      <div style={{
        marginLeft: "auto",
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "11px",
        padding: "2px 8px",
        borderRadius: "4px",
        background: `${nodeColor}18`,
        border: `1px solid ${nodeColor}40`,
        color: nodeColor,
        flexShrink: 0,
      }}>
        {event.node}
      </div>
    </div>
  );
}

// ── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data, color }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w = 80, h = 28;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (v / max) * h;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      {/* Last dot */}
      {(() => {
        const last = data[data.length - 1];
        const x = w;
        const y = h - (last / max) * h;
        return <circle cx={x} cy={y} r="2.5" fill={color} />;
      })()}
    </svg>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────────
export default function PreemptionPanel() {
  const [events,      setEvents]      = useState([]);
  const [animQueue,   setAnimQueue]   = useState([]);
  const [history,     setHistory]     = useState([]); // sparkline counts per tick
  const [nodeStats,   setNodeStats]   = useState({});
  const prevIds = useRef(new Set());

  // ── Fetch & diff ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/events");
        const data = res.data;
        setEvents(data);

        // Detect new events by unique key
        const newOnes = data.filter(e => {
          const key = `${e.old_task}-${e.new_task}-${e.node}`;
          return !prevIds.current.has(key);
        });

        newOnes.forEach(e => {
          const key = `${e.old_task}-${e.new_task}-${e.node}`;
          prevIds.current.add(key);
        });

        if (newOnes.length > 0) {
          setAnimQueue(prev => [
            ...prev,
            ...newOnes.map(e => ({ ...e, animId: `${e.old_task}-${Date.now()}-${Math.random()}` }))
          ].slice(-3));
        }

        // Sparkline history
        setHistory(prev => [...prev.slice(-30), data.length]);

        // Per-node stats
        const stats = {};
        data.forEach(e => {
          stats[e.node] = (stats[e.node] || 0) + 1;
        });
        setNodeStats(stats);

      } catch (err) {
        console.error("Events API Error:", err);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 2000);
    return () => clearInterval(interval);
  }, []);

  const removeAnim = (animId) => {
    setAnimQueue(prev => prev.filter(e => e.animId !== animId));
  };

  const nodeColors = { edge_1: "#00d68f", edge_2: "#0ea5e9", cloud: "#f59e0b" };

  return (
    <div className="card">
      {/* Header */}
      <div className="card-header">
        <span className="card-title">
          <span className="card-title-icon">⚡</span>
          Preemption Events
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {events.length > 0 && (
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "11px",
              color: "#8892a4"
            }}>
              {events.length} total
            </span>
          )}
          <span className="badge badge-amber">
            <span className="pulse pulse-amber" style={{ width: 6, height: 6 }} />
            Live
          </span>
        </div>
      </div>

      {/* Stats row */}
      {events.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "10px",
          marginBottom: "16px",
        }}>
          {Object.entries(nodeStats).map(([node, count]) => (
            <div key={node} style={{
              background: "#0d1117",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "8px",
              padding: "10px 12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <div>
                <div style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "11px",
                  color: nodeColors[node] || "#a78bfa",
                  marginBottom: "2px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em"
                }}>{node}</div>
                <div style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#e2e8f0",
                  lineHeight: 1,
                }}>{count}</div>
              </div>
              <Sparkline
                data={history.map(() => Math.floor(Math.random() * count + 1))}
                color={nodeColors[node] || "#a78bfa"}
              />
            </div>
          ))}
        </div>
      )}

      {/* Live animation zone */}
      {animQueue.length > 0 && (
        <div style={{ marginBottom: "14px" }}>
          <div style={{
            fontSize: "11px",
            fontFamily: "'IBM Plex Mono', monospace",
            color: "#f97316",
            marginBottom: "8px",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}>
            <span className="pulse pulse-amber" style={{ width: 6, height: 6 }} />
            Active preemptions
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {animQueue.map(e => (
              <PreemptionAnimation
                key={e.animId}
                event={e}
                onDone={() => removeAnim(e.animId)}
              />
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
          color: "#4a5568",
        }}>
          <div style={{ fontSize: "22px", marginBottom: "8px" }}>⚡</div>
          <div style={{ fontSize: "13px" }}>No preemption events yet</div>
        </div>
      ) : (
        <div>
          <div style={{
            fontSize: "11px",
            fontFamily: "'IBM Plex Mono', monospace",
            color: "#4a5568",
            marginBottom: "8px",
            textTransform: "uppercase",
            letterSpacing: "0.06em"
          }}>
            Event Log
          </div>

          <div style={{
            maxHeight: "260px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            paddingRight: "4px",
          }}>
            {[...events].reverse().map((e, i) => {
              const nodeColor = nodeColors[e.node] || "#a78bfa";
              return (
                <div
                  key={i}
                  className="fade-in"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 12px",
                    borderRadius: "7px",
                    background: "#0d1117",
                    border: "1px solid rgba(255,255,255,0.05)",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={e2 => e2.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"}
                  onMouseLeave={e2 => e2.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"}
                >
                  {/* Icon */}
                  <div style={{
                    width: "26px", height: "26px",
                    borderRadius: "6px",
                    background: "rgba(249,115,22,0.12)",
                    border: "1px solid rgba(249,115,22,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px",
                    flexShrink: 0,
                  }}>⇄</div>

                  {/* Task swap */}
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                    <span style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "12px",
                      color: "#f43f5e",
                      background: "rgba(244,63,94,0.1)",
                      padding: "1px 7px",
                      borderRadius: "4px",
                      whiteSpace: "nowrap",
                    }}>
                      {e.old_task.slice(0, 8)}
                    </span>
                    <span style={{ color: "#4a5568", fontSize: "12px" }}>→</span>
                    <span style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "12px",
                      color: "#00d68f",
                      background: "rgba(0,214,143,0.1)",
                      padding: "1px 7px",
                      borderRadius: "4px",
                      whiteSpace: "nowrap",
                    }}>
                      {e.new_task.slice(0, 8)}
                    </span>
                  </div>

                  {/* Node */}
                  <span style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "11px",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    background: `${nodeColor}15`,
                    border: `1px solid ${nodeColor}35`,
                    color: nodeColor,
                    flexShrink: 0,
                  }}>
                    {e.node}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}