import { useEffect, useState } from "react";
import { getLearning } from "../services/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function LearningPanel() {
  const [data,  setData]  = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getLearning();
        if (Array.isArray(res?.data)) {
          setData(res.data.slice(-30));
          setError(false);
        }
      } catch {
        setError(true);
      }
    };
    fetch();
    const t = setInterval(fetch, 2500);
    return () => clearInterval(t);
  }, []);

  const axisStyle = {
    fill: "#3d506e",
    fontSize: 10,
    fontFamily: "'JetBrains Mono', monospace",
  };

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
      }}>
        {payload.map(p => (
          <div key={p.dataKey} style={{
            color: p.color,
            display: "flex",
            justifyContent: "space-between",
            gap: "16px",
            marginBottom: "2px",
          }}>
            <span style={{ color: "#7a90b8" }}>{p.dataKey}</span>
            <span style={{ fontWeight: 600 }}>
              {typeof p.value === "number" ? p.value.toFixed(3) : p.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">◈ Learning Metrics</span>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {error && <span className="badge badge-amber">⚠ No Data</span>}
          <span className="badge badge-violet">
            <span className="pulse pulse-cyan" />
            Training
          </span>
        </div>
      </div>

      {data.length === 0 ? (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "120px",
          color: "var(--text-muted)",
          gap: "10px",
          flexDirection: "column",
        }}>
          <div style={{ fontSize: "24px", opacity: 0.2 }}>◈</div>
          <div style={{ fontSize: "13px" }}>
            {error ? "Learning API unavailable" : "Collecting training data…"}
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,160,255,0.04)" />
            <XAxis dataKey="time" tick={axisStyle} interval="preserveStartEnd" />
            <YAxis tick={axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                fontSize: "11px",
                fontFamily: "'JetBrains Mono', monospace",
                color: "#7a90b8",
              }}
            />
            <Line dataKey="latency"  stroke="#22d3ee" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            <Line dataKey="resource" stroke="#8b5cf6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            <Line dataKey="trust"    stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 2" activeDot={{ r: 4 }} />
            <Line dataKey="queue"    stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="2 2" activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}