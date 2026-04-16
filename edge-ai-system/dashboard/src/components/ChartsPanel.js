import {
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Area, AreaChart
} from "recharts";
import { useEffect, useState } from "react";
import { getMetrics, getLearning } from "../services/api";

const COLOR_PALETTE = [
  "#22d3ee", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#10b981", "#ec4899"
];
const getColor = (i) => COLOR_PALETTE[i % COLOR_PALETTE.length];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#131c2e",
      border: "1px solid rgba(120,160,255,0.18)",
      borderRadius: "8px",
      padding: "10px 14px",
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: "11px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
    }}>
      <div style={{ color: "#7a90b8", marginBottom: "7px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.07em" }}>
        {label}
      </div>
      {payload.map(p => (
        <div key={p.dataKey} style={{
          color: p.color,
          display: "flex",
          justifyContent: "space-between",
          gap: "20px",
          marginBottom: "3px",
        }}>
          <span style={{ color: "#7a90b8" }}>{p.dataKey}</span>
          <span style={{ fontWeight: 600 }}>
            {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const axisStyle  = { fill: "#3d506e", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" };
const legendStyle = { fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#7a90b8" };

// ── Chart wrapper card ─────────────────────────────────────────────────────
function ChartCard({ title, badge, children, fullWidth = false }) {
  return (
    <div className="card fade-in" style={fullWidth ? { gridColumn: "1 / -1" } : {}}>
      <div className="card-header">
        <span className="card-title">{title}</span>
        {badge && <span className={`badge badge-${badge.color}`}>{badge.label}</span>}
      </div>
      {children}
    </div>
  );
}

export default function ChartsPanel({ nodes = {} }) {
  const [history,        setHistory]        = useState([]);
  const [metricsHistory, setMetricsHistory] = useState([]);
  const [learningHistory,setLearningHistory] = useState([]);

  const nodeIds = Object.keys(nodes);

  useEffect(() => {
    const tick = setInterval(async () => {
      const time = new Date().toLocaleTimeString([], { hour12: false });
      const snap = { time };

      nodeIds.forEach(id => {
        const n = nodes[id];
        if (!n) return;
        snap[`${id}_load`]  = (n.running || 0) + (n.queue || 0);
        snap[`${id}_queue`] = n.queue || 0;
        snap[`${id}_trust`] = parseFloat(((n.trust || 0) * 100).toFixed(1));
      });

      setHistory(prev => [...prev.slice(-25), snap]);

      // Metrics
      try {
        const res = await getMetrics();
        if (res?.data) {
          setMetricsHistory(prev => [...prev.slice(-25), {
            time,
            success: parseFloat((res.data.success_rate || 0).toFixed(3)),
            failure: parseFloat((res.data.failure_rate || 0).toFixed(3)),
          }]);
        }
      } catch { /* silent */ }

      // Learning
      try {
        const res = await getLearning();
        if (Array.isArray(res?.data)) {
          setLearningHistory(res.data.slice(-25));
        }
      } catch { /* silent */ }

    }, 2000);

    return () => clearInterval(tick);
  }, [nodes]);

  // Bar data
  const barData = nodeIds.map((id, i) => ({
    name: id.replace(/_/g, " "),
    running: nodes[id]?.running || 0,
    queue:   nodes[id]?.queue   || 0,
    trust:   parseFloat(((nodes[id]?.trust || 0) * 100).toFixed(1)),
    _color:  getColor(i),
  }));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

      {/* Running vs Queue */}
      <ChartCard title="⚙ Running vs Queue" badge={{ label: "Snapshot", color: "blue" }}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData} barGap={4}>
            <CartesianGrid stroke="rgba(120,160,255,0.04)" vertical={false} />
            <XAxis dataKey="name" tick={axisStyle} />
            <YAxis tick={axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={legendStyle} />
            <Bar dataKey="running" fill="#10b981" radius={[3,3,0,0]} />
            <Bar dataKey="queue"   fill="#3b82f6" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Trust Score — FIXED: use Cell for per-bar color */}
      <ChartCard title="◎ Trust Score">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData}>
            <XAxis dataKey="name" tick={axisStyle} />
            <YAxis tick={axisStyle} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="trust" radius={[3,3,0,0]}>
              {barData.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={getColor(i)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Load Over Time */}
      <ChartCard title="↗ Load Over Time">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={history}>
            <defs>
              {nodeIds.map((id, i) => (
                <linearGradient key={id} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={getColor(i)} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={getColor(i)} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,160,255,0.04)" />
            <XAxis dataKey="time" tick={axisStyle} interval="preserveStartEnd" />
            <YAxis tick={axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={legendStyle} />
            {nodeIds.map((id, i) => (
              <Area
                key={id}
                dataKey={`${id}_load`}
                stroke={getColor(i)}
                fill={`url(#grad-${i})`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Queue Over Time */}
      <ChartCard title="⬡ Queue Over Time">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,160,255,0.04)" />
            <XAxis dataKey="time" tick={axisStyle} interval="preserveStartEnd" />
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
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Trust Over Time — FIXED: domain [0,100] since we store as percentage */}
      <ChartCard title="◎ Trust Score Over Time" fullWidth>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,160,255,0.04)" />
            <XAxis dataKey="time" tick={axisStyle} interval="preserveStartEnd" />
            <YAxis domain={[0, 100]} tick={axisStyle} tickFormatter={v => `${v}%`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={legendStyle} />
            {nodeIds.map((id, i) => (
              <Line
                key={id}
                dataKey={`${id}_trust`}
                stroke={getColor(i)}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Success vs Failure */}
      <ChartCard title="✔ Success vs Failure Rate" badge={{ label: "Live", color: "green" }}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={metricsHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,160,255,0.04)" />
            <XAxis dataKey="time" tick={axisStyle} interval="preserveStartEnd" />
            <YAxis tick={axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={legendStyle} />
            <Line dataKey="success" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            <Line dataKey="failure" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="4 2" activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* RL Learning */}
      <ChartCard title="◎ RL Agent Learning Curve" badge={{ label: "AI", color: "violet" }}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={learningHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,160,255,0.04)" />
            <XAxis dataKey="time" tick={axisStyle} interval="preserveStartEnd" />
            <YAxis tick={axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={legendStyle} />
            <Line dataKey="latency"  stroke="#22d3ee"  strokeWidth={2} dot={false} />
            <Line dataKey="resource" stroke="#8b5cf6"  strokeWidth={2} dot={false} />
            <Line dataKey="trust"    stroke="#f59e0b"  strokeWidth={2} dot={false} strokeDasharray="5 2" />
            <Line dataKey="queue"    stroke="#10b981"  strokeWidth={2} dot={false} strokeDasharray="2 2" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

    </div>
  );
}