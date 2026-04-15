import { useEffect, useState } from "react";
import { getNodes } from "../services/api";
import ControlRoom from "../components/ControlRoom";
import ChartsPanel from "../components/ChartsPanel";
import Alerts from "../components/Alerts";
import TaskFlow from "../components/TaskFlow";
import PreemptionPanel from "../components/PreemptionPanel";
import LearningPanel from "../components/LearningPanel";
import RLPanel from "../components/RLPanel";
function StatBar({ nodes }) {
  const totalRunning = Object.values(nodes).reduce((s, n) => s + n.running, 0);
  const totalQueued = Object.values(nodes).reduce((s, n) => s + n.queue, 0);
  const avgTrust = Object.values(nodes).length
    ? Object.values(nodes).reduce((s, n) => s + n.trust, 0) /
      Object.values(nodes).length
    : 0;
  const nodeCount = Object.keys(nodes).length;

  const stats = [
    { label: "Active Nodes", value: nodeCount, suffix: "", color: "#00d68f" },
    {
      label: "Tasks Running",
      value: totalRunning,
      suffix: "",
      color: "#0ea5e9",
    },
    { label: "Tasks Queued", value: totalQueued, suffix: "", color: "#f59e0b" },
    {
      label: "Avg Trust Score",
      value: (avgTrust * 100).toFixed(1),
      suffix: "%",
      color: "#a78bfa",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "16px",
        marginBottom: "20px",
      }}
    >
      {stats.map((s) => (
        <div key={s.label} className="card" style={{ padding: "18px 20px" }}>
          <div className="stat-label" style={{ marginBottom: "8px" }}>
            {s.label}
          </div>
          <div className="stat-value" style={{ color: s.color }}>
            {s.value}
            {s.suffix}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [nodes, setNodes] = useState({});

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const res = await getNodes();
        if (mounted) setNodes({ ...res.data });
      } catch (err) {
        console.error("API Error:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="page-content">
      {/* Breadcrumb */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "20px",
          fontSize: "12px",
          color: "#4a5568",
          fontFamily: "'IBM Plex Mono', monospace",
        }}
      >
        <span style={{ color: "#8892a4" }}>Edge AI</span>
        <span>/</span>
        <span style={{ color: "#e2e8f0" }}>Overview</span>
      </div>

      <StatBar nodes={nodes} />

      {/* Main 2-col grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        <ControlRoom nodes={nodes} />
        <Alerts nodes={nodes} />
      </div>

      <div style={{ marginBottom: "16px" }}>
        <TaskFlow />
      </div>
      <div style={{ marginBottom: "16px" }}>
        <PreemptionPanel />
      </div>
      <ChartsPanel nodes={nodes} />

      <div style={{ marginTop: "16px" }}>
  <LearningPanel />
    </div>
    <div style={{ marginTop: "16px" }}>
  <RLPanel />
</div>
    </div>

  );
}
