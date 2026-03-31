import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Area, AreaChart
} from "recharts";
import { useEffect, useState } from "react";

const COLORS = {
  edge_1: "#00d68f",
  edge_2: "#0ea5e9",
  cloud:  "#f59e0b",
};

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

  useEffect(() => {
    const interval = setInterval(() => {
      const snapshot = {
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        edge_1_load:  nodes.edge_1 ? nodes.edge_1.running + nodes.edge_1.queue : 0,
        edge_2_load:  nodes.edge_2 ? nodes.edge_2.running + nodes.edge_2.queue : 0,
        cloud_load:   nodes.cloud  ? nodes.cloud.running  + nodes.cloud.queue  : 0,
        edge_1_queue: nodes.edge_1?.queue ?? 0,
        edge_2_queue: nodes.edge_2?.queue ?? 0,
        cloud_queue:  nodes.cloud?.queue  ?? 0,
        edge_1_trust: nodes.edge_1?.trust ?? 0,
        edge_2_trust: nodes.edge_2?.trust ?? 0,
        cloud_trust:  nodes.cloud?.trust  ?? 0,
      };
      setHistory(prev => [...prev.slice(-20), snapshot]);
    }, 2000);
    return () => clearInterval(interval);
  }, [nodes]);

  const barData = Object.entries(nodes).map(([id, n]) => ({
    name:    id.replace("_", " "),
    running: n.running,
    queue:   n.queue,
    trust:   parseFloat((n.trust * 100).toFixed(1)),
  }));

  const axisStyle  = { fill: "#4a5568", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" };
  const gridStyle  = { stroke: "rgba(255,255,255,0.04)" };
  const legendStyle = { fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: "#8892a4" };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

      {/* Running vs Queue */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">⚙ Running vs Queue</span>
          <span className="badge badge-blue">Snapshot</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData} barGap={4} barSize={20}>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={28} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Legend wrapperStyle={legendStyle} />
            <Bar dataKey="running" fill="#00d68f" radius={[3, 3, 0, 0]} />
            <Bar dataKey="queue"   fill="#0ea5e9" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Trust Score */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">◎ Trust Score</span>
          <span className="badge badge-blue">% per node</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData} barSize={28}>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={axisStyle} axisLine={false} tickLine={false} width={34} tickFormatter={v => `${v}%`} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Bar dataKey="trust" radius={[3, 3, 0, 0]}>
              {barData.map((entry, index) => {
                const nodeKey = Object.keys(COLORS)[index] || "edge_1";
                return <rect key={`bar-${index}`} fill={Object.values(COLORS)[index] || "#a78bfa"} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Load Over Time */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">↗ Load Over Time</span>
          <span className="badge badge-green">Live · 2s</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={history}>
            <defs>
              {Object.entries(COLORS).map(([key, color]) => (
                <linearGradient key={key} id={`grad_load_${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={color} stopOpacity={0}    />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="time" tick={axisStyle} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={28} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={legendStyle} />
            <Area dataKey="edge_1_load" stroke={COLORS.edge_1} fill={`url(#grad_load_edge_1)`} strokeWidth={2} dot={false} />
            <Area dataKey="edge_2_load" stroke={COLORS.edge_2} fill={`url(#grad_load_edge_2)`} strokeWidth={2} dot={false} />
            <Area dataKey="cloud_load"  stroke={COLORS.cloud}  fill={`url(#grad_load_cloud)`}  strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Queue Over Time */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">⬡ Queue Over Time</span>
          <span className="badge badge-green">Live · 2s</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="time" tick={axisStyle} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={28} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={legendStyle} />
            <Line dataKey="edge_1_queue" stroke={COLORS.edge_1} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            <Line dataKey="edge_2_queue" stroke={COLORS.edge_2} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            <Line dataKey="cloud_queue"  stroke={COLORS.cloud}  strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Trust Over Time — full width */}
      <div className="card" style={{ gridColumn: "1 / -1" }}>
        <div className="card-header">
          <span className="card-title">◎ Trust Score Over Time</span>
          <span className="badge badge-green">Live · 2s</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={history}>
            <defs>
              {Object.entries(COLORS).map(([key, color]) => (
                <linearGradient key={key} id={`grad_trust_${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={color} stopOpacity={0}   />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="time" tick={axisStyle} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis domain={[0, 1]} tick={axisStyle} axisLine={false} tickLine={false} width={34} tickFormatter={v => `${(v * 100).toFixed(0)}%`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={legendStyle} />
            <Line dataKey="edge_1_trust" stroke={COLORS.edge_1} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            <Line dataKey="edge_2_trust" stroke={COLORS.edge_2} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            <Line dataKey="cloud_trust"  stroke={COLORS.cloud}  strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}