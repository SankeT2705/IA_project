import { useEffect, useState, useRef } from "react";
import axios from "axios";

const COLORS = ["#22d3ee", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#10b981", "#ec4899"];
const getColor = (i) => COLORS[i % COLORS.length];

const PIPELINE_STAGES = [
  { label: "Ingested", color: "#22d3ee" },
  { label: "Queued",   color: "#3b82f6" },
  { label: "Running",  color: "#10b981" },
  { label: "Complete", color: "#8b5cf6" },
];

export default function TaskFlow() {
  const [lanes,   setLanes]   = useState([]);
  const [packets, setPackets] = useState([]);
  const [counts,  setCounts]  = useState({ pending: 0, queued: 0, running: 0, completed: 0 });
  const animRef = useRef(null);

  // Fetch nodes
  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/nodes");
        const nodeIds = Object.keys(res.data || {});
        setLanes(nodeIds.map((id, i) => ({ id, color: getColor(i) })));
      } catch { /* use empty lanes */ }
    };
    fetchNodes();
    const t = setInterval(fetchNodes, 5000);
    return () => clearInterval(t);
  }, []);

  // Fetch tasks and build packets
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/tasks");
        const tasks = Array.isArray(res.data) ? res.data : [];

        const newPackets = tasks
          .filter(t => t.status === "running" && t.node)
          .map(t => ({
            id:   t.task_id,
            lane: t.node,
            x:    Math.random() * 40 + 10,
          }));

        setPackets(newPackets);

        // Count by status
        const statusCount = { pending: 0, queued: 0, running: 0, completed: 0 };
        tasks.forEach(t => {
          const s = t.status?.toLowerCase();
          if (s in statusCount) statusCount[s]++;
        });
        setCounts(statusCount);

      } catch { /* silent */ }
    };
    fetchTasks();
    const t = setInterval(fetchTasks, 2500);
    return () => clearInterval(t);
  }, []);

  // Animate packets
  useEffect(() => {
    const move = () => {
      setPackets(prev =>
        prev
          .map(p => ({ ...p, x: p.x + 1.5 }))
          .filter(p => p.x < 110)  // remove off-screen
      );
    };
    animRef.current = setInterval(move, 100);
    return () => clearInterval(animRef.current);
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">↻ Task Flow</span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--text-muted)",
          }}>
            {packets.length} active streams
          </span>
          <span className="badge badge-green">
            <span className="pulse pulse-green" />
            Active
          </span>
        </div>
      </div>

      {/* Pipeline stages */}
      <div style={{
        display: "flex",
        gap: "8px",
        marginBottom: "18px",
      }}>
        {PIPELINE_STAGES.map((stage, i) => {
          const countKey = stage.label.toLowerCase().replace("complete", "completed").replace("ingested", "pending");
          const count = counts[countKey] || 0;
          return (
            <div key={stage.label} style={{
              flex: 1,
              padding: "10px 14px",
              background: `${stage.color}08`,
              border: `1px solid ${stage.color}20`,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}>
              <div style={{
                width: "8px", height: "8px",
                borderRadius: "50%",
                background: stage.color,
                boxShadow: `0 0 6px ${stage.color}`,
                flexShrink: 0,
              }} />
              <div>
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: stage.color,
                  lineHeight: 1,
                }}>
                  {count}
                </div>
                <div style={{
                  fontSize: "10px",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginTop: "2px",
                }}>
                  {stage.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lane visualization */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {lanes.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px 0", fontSize: "12px" }}>
            No nodes connected
          </div>
        ) : (
          lanes.map((lane, laneIdx) => {
            const lanePackets = packets.filter(p => p.lane === lane.id);
            return (
              <div key={lane.id} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {/* Label */}
                <div style={{
                  width: "80px",
                  fontSize: "10px",
                  fontFamily: "var(--font-mono)",
                  color: lane.color,
                  textAlign: "right",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  flexShrink: 0,
                }}>
                  {lane.id.replace(/_/g, " ")}
                </div>

                {/* Track */}
                <div style={{
                  flex: 1,
                  height: "26px",
                  background: "var(--bg-surface)",
                  borderRadius: "6px",
                  position: "relative",
                  overflow: "hidden",
                  border: "1px solid var(--border-faint)",
                }}>
                  {/* Centerline */}
                  <div style={{
                    position: "absolute",
                    top: "50%",
                    left: 0,
                    right: 0,
                    height: "1px",
                    background: `${lane.color}18`,
                    transform: "translateY(-50%)",
                  }} />

                  {/* Packets */}
                  {lanePackets.map(p => (
                    <div
                      key={p.id}
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: `${Math.min(p.x, 100)}%`,
                        transform: "translate(-50%, -50%)",
                        width: "9px",
                        height: "9px",
                        borderRadius: "3px",
                        background: lane.color,
                        boxShadow: `0 0 8px ${lane.color}`,
                        opacity: Math.max(0, 1 - p.x / 105),
                        transition: "left 0.1s linear",
                      }}
                    />
                  ))}
                </div>

                {/* Count badge */}
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: lanePackets.length > 0 ? lane.color : "var(--text-ghost)",
                  minWidth: "24px",
                  textAlign: "right",
                }}>
                  {lanePackets.length}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}