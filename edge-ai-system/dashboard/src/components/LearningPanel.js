import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from "recharts";

const COLORS = {
  latency: "#00d68f",
  resource: "#0ea5e9",
  energy: "#f59e0b",
  success: "#22c55e",
  trust: "#a78bfa",
  queue: "#f43f5e"
};

export default function LearningPanel() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/learning");

        const formatted = res.data.map(d => ({
          time: new Date(d.time * 1000).toLocaleTimeString(),
          ...d
        }));

        setData(formatted);
      } catch (err) {
        console.error("Learning API Error:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">🧠 Learning Evolution</span>
        <span className="badge badge-blue">Adaptive</span>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="time" tick={{ fill: "#4a5568", fontSize: 11 }} />
          <YAxis tick={{ fill: "#4a5568", fontSize: 11 }} />
          <Tooltip />
          <Legend />

          {Object.keys(COLORS).map(key => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={COLORS[key]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}