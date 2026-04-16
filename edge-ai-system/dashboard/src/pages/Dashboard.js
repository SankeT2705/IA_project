import { useEffect, useState, useCallback } from "react";
import { getNodes, getConfig } from "../services/api";
import ControlRoom from "../components/ControlRoom";
import ChartsPanel from "../components/ChartsPanel";
import Alerts from "../components/Alerts";
import TaskFlow from "../components/TaskFlow";
import PreemptionPanel from "../components/PreemptionPanel";
import LearningPanel from "../components/LearningPanel";
import RLPanel from "../components/RLPanel";
import SystemHealth from "../components/SystemHealth";
import axios from "axios";

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, suffix = "", color, icon, delta }) {
  return (
    <div className="card" style={{ padding: "20px 22px" }}>
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: "14px",
      }}>
        <div style={{
          width: "36px", height: "36px",
          borderRadius: "9px",
          background: `${color}14`,
          border: `1px solid ${color}28`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "15px",
          color: color,
        }}>
          {icon}
        </div>
        {delta !== undefined && (
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: delta >= 0 ? "var(--neon-green)" : "var(--neon-red)",
            background: delta >= 0 ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
            border: `1px solid ${delta >= 0 ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
            padding: "2px 7px",
            borderRadius: "4px",
          }}>
            {delta >= 0 ? "+" : ""}{delta}%
          </span>
        )}
      </div>

      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: "28px",
        fontWeight: 700,
        color: color,
        lineHeight: 1,
        marginBottom: "5px",
        letterSpacing: "-0.02em",
      }}>
        {value}<span style={{ fontSize: "16px", opacity: 0.7 }}>{suffix}</span>
      </div>

      <div className="stat-label">{label}</div>

      <div className="progress-track" style={{ marginTop: "12px" }}>
        <div className="progress-fill" style={{
          width: `${Math.min(100, typeof value === 'number' ? value * 5 : 60)}%`,
          background: `linear-gradient(90deg, ${color}55, ${color})`,
        }} />
      </div>
    </div>
  );
}

// ── Control Bar ────────────────────────────────────────────────────────────
function ControlBar({ isRunning, onToggle, speed, onSpeedChange }) {
  const speeds = [0.5, 1, 2, 5];

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px 18px",
      background: "var(--bg-elevated)",
      border: "1px solid var(--border-dim)",
      borderRadius: "var(--r-lg)",
      marginBottom: "20px",
    }}>
      {/* Play/Pause */}
      <button
        onClick={onToggle}
        className="btn"
        style={{
          background: isRunning ? "rgba(239,68,68,0.10)" : "rgba(16,185,129,0.10)",
          color: isRunning ? "var(--neon-red)" : "var(--neon-green)",
          borderColor: isRunning ? "rgba(239,68,68,0.25)" : "rgba(16,185,129,0.25)",
          fontWeight: 600,
          minWidth: "90px",
          justifyContent: "center",
        }}
      >
        {isRunning ? "⏸ Pause" : "▶ Resume"}
      </button>

      <div style={{ width: "1px", height: "20px", background: "var(--border-dim)" }} />

      {/* Speed control */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
          Speed
        </span>
        {speeds.map(s => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className="btn"
            style={{
              padding: "4px 10px",
              fontSize: "11px",
              background: speed === s ? "rgba(59,130,246,0.12)" : "transparent",
              color: speed === s ? "var(--neon-blue)" : "var(--text-muted)",
              borderColor: speed === s ? "rgba(59,130,246,0.3)" : "var(--border-faint)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {s}×
          </button>
        ))}
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
        <span className={`pulse ${isRunning ? "pulse-green" : "pulse-amber"}`} />
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: isRunning ? "var(--neon-green)" : "var(--neon-amber)",
        }}>
          {isRunning ? "SIMULATION LIVE" : "PAUSED"}
        </span>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function Dashboard() {
  const [nodes, setNodes] = useState({});
  const [intervalTime, setIntervalTime] = useState(2000);
  const [isRunning, setIsRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [prevNodes, setPrevNodes] = useState({});
  const [loadError, setLoadError] = useState(false);

  // Derived stats
  const totalRunning = Object.values(nodes).reduce((s, n) => s + (n.running || 0), 0);
  const totalQueued  = Object.values(nodes).reduce((s, n) => s + (n.queue || 0), 0);
  const avgTrust     = Object.values(nodes).length
    ? Object.values(nodes).reduce((s, n) => s + (n.trust || 0), 0) / Object.values(nodes).length
    : 0;
  const nodeCount    = Object.keys(nodes).length;

  // Load config
  useEffect(() => {
    getConfig()
      .then(res => {
        const ms = (res.data?.simulation_interval || 2) * 1000;
        setIntervalTime(ms / 3);
      })
      .catch(() => {}); // silent fail, use default
  }, []);

  // Fetch node data
  const fetchData = useCallback(async () => {
    if (!isRunning) return;
    try {
      const res = await getNodes();
      setPrevNodes(nodes);
      setNodes(res.data || {});
      setLoadError(false);
    } catch (err) {
      setLoadError(true);
      console.error("Node fetch error:", err);
    }
  }, [isRunning, nodes]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, intervalTime / speed);
    return () => clearInterval(interval);
  }, [intervalTime, isRunning, speed]);

  // Play / Pause
  const toggleSimulation = async () => {
    try {
      if (isRunning) {
        await axios.post("http://127.0.0.1:8000/simulation/pause");
        setIsRunning(false);
      } else {
        await axios.post("http://127.0.0.1:8000/simulation/play");
        setIsRunning(true);
      }
    } catch {
      // Toggle locally if endpoint unavailable
      setIsRunning(v => !v);
    }
  };

  const stats = [
    { label: "Active Nodes",   value: nodeCount,                     suffix: "",  color: "var(--neon-cyan)",   icon: "⬡" },
    { label: "Tasks Running",  value: totalRunning,                  suffix: "",  color: "var(--neon-blue)",   icon: "⚙" },
    { label: "Tasks Queued",   value: totalQueued,                   suffix: "",  color: "var(--neon-amber)",  icon: "≡" },
    { label: "Avg Trust Score",value: (avgTrust * 100).toFixed(1),   suffix: "%", color: "var(--neon-violet)", icon: "◎" },
  ];

  return (
    <div className="page-content">
      {/* Breadcrumb */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        marginBottom: "22px",
        fontSize: "11px",
        color: "var(--text-muted)",
        fontFamily: "var(--font-mono)",
        letterSpacing: "0.05em",
      }}>
        <span style={{ color: "var(--text-secondary)" }}>Edge AI</span>
        <span style={{ opacity: 0.4 }}>/</span>
        <span style={{ color: "var(--neon-blue)" }}>Overview</span>
        {loadError && (
          <span className="badge badge-red" style={{ marginLeft: "auto" }}>
            ⚠ API Unreachable
          </span>
        )}
      </div>

      {/* Section header */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{
          fontFamily: "var(--font-sans)",
          fontSize: "22px",
          fontWeight: 700,
          color: "var(--text-primary)",
          letterSpacing: "-0.01em",
          marginBottom: "4px",
        }}>
          Resource Allocation Dashboard
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
          Intelligent workload distribution across edge and cloud infrastructure
        </p>
      </div>

      {/* Control Bar */}
      <ControlBar
        isRunning={isRunning}
        onToggle={toggleSimulation}
        speed={speed}
        onSpeedChange={setSpeed}
      />

      {/* Stat cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "14px",
        marginBottom: "18px",
      }}>
        {stats.map(s => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* System Health Banner */}
      <div style={{ marginBottom: "18px" }}>
        <SystemHealth nodes={nodes} />
      </div>

      {/* Main 2-col */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <ControlRoom nodes={nodes} prevNodes={prevNodes} />
        <Alerts nodes={nodes} />
      </div>

      {/* Task Flow */}
      <div style={{ marginBottom: "16px" }}>
        <TaskFlow />
      </div>

      {/* Preemption */}
      <div style={{ marginBottom: "16px" }}>
        <PreemptionPanel />
      </div>

      {/* Charts */}
      <ChartsPanel nodes={nodes} />

      {/* Learning */}
      <div style={{ marginTop: "16px" }}>
        <LearningPanel />
      </div>

      {/* RL */}
      <div style={{ marginTop: "16px" }}>
        <RLPanel />
      </div>
    </div>
  );
}