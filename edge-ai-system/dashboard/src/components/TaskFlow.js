import { useEffect, useState } from "react";

const LANES = [
  { label: "Edge 1 →",  color: "#00d68f" },
  { label: "Edge 2 →",  color: "#0ea5e9" },
  { label: "Cloud  →",  color: "#f59e0b" },
];

export default function TaskFlow() {
  const [packets, setPackets] = useState([]);

  // Spawn packets
  useEffect(() => {
    const interval = setInterval(() => {
      const lane = Math.floor(Math.random() * LANES.length);
      setPackets(prev => [
        ...prev,
        { id: Date.now() + Math.random(), lane, x: 0, size: Math.floor(Math.random() * 3) + 1 }
      ]);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Move packets
  useEffect(() => {
    const move = setInterval(() => {
      setPackets(prev =>
        prev
          .map(p => ({ ...p, x: p.x + 6 }))
          .filter(p => p.x < 104)
      );
    }, 100);
    return () => clearInterval(move);
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">
          <span className="card-title-icon">↻</span>
          Task Flow
        </span>
        <span className="badge badge-green">
          <span className="pulse pulse-green" style={{ width: 6, height: 6 }} />
          Active
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {LANES.map((lane, laneIdx) => (
          <div key={laneIdx} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "70px",
              fontSize: "11px",
              fontFamily: "'IBM Plex Mono', monospace",
              color: lane.color,
              flexShrink: 0,
              textAlign: "right"
            }}>
              {lane.label}
            </div>
            <div style={{
              flex: 1,
              height: "28px",
              background: "#0d1117",
              borderRadius: "6px",
              position: "relative",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              {/* Track line */}
              <div style={{
                position: "absolute",
                top: "50%",
                left: 0, right: 0,
                height: "1px",
                background: `${lane.color}22`,
                transform: "translateY(-50%)"
              }} />

              {/* Packets */}
              {packets
                .filter(p => p.lane === laneIdx)
                .map(dot => (
                  <div
                    key={dot.id}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: `${dot.x}%`,
                      transform: "translate(-50%, -50%)",
                      width: `${6 + dot.size * 2}px`,
                      height: `${6 + dot.size * 2}px`,
                      borderRadius: "3px",
                      background: lane.color,
                      boxShadow: `0 0 8px ${lane.color}88`,
                      opacity: 1 - dot.x / 120,
                    }}
                  />
                ))
              }
            </div>
          </div>
        ))}
      </div>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: "14px",
        paddingTop: "12px",
        borderTop: "1px solid rgba(255,255,255,0.06)"
      }}>
        {["Source", "Processing", "Dispatched", "Complete"].map((label, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <div style={{
              width: "8px", height: "8px",
              borderRadius: "50%",
              background: i === 0 ? "#00d68f" : i === 3 ? "#a78bfa" : "#1c2333",
              border: `1px solid ${i === 0 ? "#00d68f" : i === 3 ? "#a78bfa" : "rgba(255,255,255,0.1)"}`,
            }} />
            <span style={{ fontSize: "10px", color: "#4a5568", fontFamily: "'IBM Plex Mono', monospace" }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}