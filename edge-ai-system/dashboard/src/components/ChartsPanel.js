import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Area, AreaChart
} from "recharts";
import { useEffect, useState } from "react";

// 🔥 AUTO COLOR GENERATOR
const COLOR_PALETTE = [
  "#00d68f", "#0ea5e9", "#f59e0b", "#f43f5e", "#a78bfa", "#22c55e", "#38bdf8"
];

const getColor = (index) => COLOR_PALETTE[index % COLOR_PALETTE.length];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#161b27",
      border: "1px solid rgba(255,255,255,0.13)",
      borderRadius: "6px",
      padding: "10px 14px",
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: "12px",
    }}>
      <div style={{ color: "#8892a4", marginBottom: "6px", fontSize: "11px" }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, display: "flex", justifyContent: "space-between", gap: "16px" }}>
          <span>{p.dataKey}</span>
          <span style={{ fontWeight: 600 }}>{typeof p.value === "number" ? p.value.toFixed(2) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function ChartsPanel({ nodes }) {
  const [history, setHistory] = useState([]);

  const nodeIds = Object.keys(nodes);

  // 🔥 DYNAMIC HISTORY
  useEffect(() => {
    const interval = setInterval(() => {
      const snapshot = {
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      };

      nodeIds.forEach(id => {
        const n = nodes[id];
        snapshot[`${id}_load`] = n.running + n.queue;
        snapshot[`${id}_queue`] = n.queue;
        snapshot[`${id}_trust`] = n.trust;
      });

      setHistory(prev => [...prev.slice(-20), snapshot]);
    },1000);

    return () => clearInterval(interval);
  }, [nodes]);

  // 🔥 BAR DATA
  const barData = nodeIds.map(id => ({
    name: id,
    running: nodes[id].running,
    queue: nodes[id].queue,
    trust: parseFloat((nodes[id].trust * 100).toFixed(1)),
  }));

  const axisStyle = { fill: "#4a5568", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" };
  const legendStyle = { fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: "#8892a4" };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

      {/* Running vs Queue */}
      <div className="card fade-in">
        <div className="card-header">
          <span className="card-title">⚙ Running vs Queue</span>
          <span className="badge badge-blue">Snapshot</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="name" tick={axisStyle} />
            <YAxis tick={axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={legendStyle} />
            <Bar dataKey="running" fill="#00d68f" />
            <Bar dataKey="queue" fill="#0ea5e9" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Trust Score */}
      <div className="card fade-in">
        <div className="card-header">
          <span className="card-title">◎ Trust Score</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData}>
            <XAxis dataKey="name" tick={axisStyle} />
            <YAxis tick={axisStyle} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="trust">
              {barData.map((_, i) => (
                <rect key={i} fill={getColor(i)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Load Over Time */}
      <div className="card fade-in">
        <div className="card-header">
          <span className="card-title">↗ Load Over Time</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="time" tick={axisStyle} />
            <YAxis tick={axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={legendStyle} />
            {nodeIds.map((id, i) => (
              <Area
                key={id}
                dataKey={`${id}_load`}
                stroke={getColor(i)}
                fill={getColor(i)}
                fillOpacity={0.2}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Queue Over Time */}
      <div className="card fade-in">
        <div className="card-header">
          <span className="card-title">⬡ Queue Over Time</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="time" tick={axisStyle} />
            <YAxis tick={axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={legendStyle} />
            {nodeIds.map((id, i) => (
              <Line
                key={id}
                dataKey={`${id}_queue`}
                stroke={getColor(i)}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Trust Over Time */}
      <div className="card fade-in" style={{ gridColumn: "1 / -1" }}>
        <div className="card-header">
          <span className="card-title">◎ Trust Score Over Time</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="time" tick={axisStyle} />
            <YAxis domain={[0, 1]} tick={axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={legendStyle} />
            {nodeIds.map((id, i) => (
              <Line
                key={id}
                dataKey={`${id}_trust`}
                stroke={getColor(i)}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}