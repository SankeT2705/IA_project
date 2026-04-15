import { useEffect, useState } from "react";
import axios from "axios";

const COLORS = [
  "#00d68f", "#0ea5e9", "#f59e0b", "#f43f5e", "#a78bfa", "#22c55e"
];

export default function TaskFlow() {
  const [lanes, setLanes] = useState([]);
  const [packets, setPackets] = useState([]);

  // 🔥 Fetch real nodes
  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/nodes");
        const nodeIds = Object.keys(res.data);

        const newLanes = nodeIds.map((id, i) => ({
          id,
          label: id.replace("_", " ") + " →",
          color: COLORS[i % COLORS.length]
        }));

        setLanes(newLanes);
      } catch (err) {
        console.error(err);
      }
    };

    fetchNodes();
    const interval = setInterval(fetchNodes, 3000);
    return () => clearInterval(interval);
  }, []);

  // 🔥 Fetch real tasks → create packets
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/tasks");

        const newPackets = res.data
          .filter(t => t.status === "running") // only active tasks
          .map(t => ({
            id: t.task_id,
            lane: t.node,
            x: Math.random() * 50 + 20, // start mid for realism
            size: 2
          }));

        setPackets(newPackets);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTasks();
    const interval = setInterval(fetchTasks, 2000);
    return () => clearInterval(interval);
  }, []);

  // 🔥 Animate movement
  useEffect(() => {
    const move = setInterval(() => {
      setPackets(prev =>
        prev.map(p => ({
          ...p,
          x: p.x + 2
        }))
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
        {lanes.map((lane, laneIdx) => (
          <div key={lane.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "90px",
              fontSize: "11px",
              fontFamily: "'IBM Plex Mono', monospace",
              color: lane.color,
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

              {/* Track */}
              <div style={{
                position: "absolute",
                top: "50%",
                left: 0,
                right: 0,
                height: "1px",
                background: `${lane.color}22`,
                transform: "translateY(-50%)"
              }} />

              {/* 🔥 REAL PACKETS */}
              {packets
                .filter(p => p.lane === lane.id)
                .map(p => (
                  <div
                    key={p.id}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: `${p.x}%`,
                      transform: "translate(-50%, -50%)",
                      width: "8px",
                      height: "8px",
                      borderRadius: "3px",
                      background: lane.color,
                      boxShadow: `0 0 8px ${lane.color}88`,
                      opacity: 1 - p.x / 120
                    }}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: "14px",
        paddingTop: "12px",
        borderTop: "1px solid rgba(255,255,255,0.06)"
      }}>
        {["Source", "Queued", "Running", "Completed"].map((label, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <div style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background:
                i === 0 ? "#00d68f" :
                i === 2 ? "#0ea5e9" :
                i === 3 ? "#a78bfa" : "#1c2333"
            }} />
            <span style={{
              fontSize: "10px",
              color: "#4a5568",
              fontFamily: "'IBM Plex Mono', monospace"
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}