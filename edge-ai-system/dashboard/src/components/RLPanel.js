import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

export default function RLPanel() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/learning");

        const formatted = res.data.map(d => ({
          time: new Date(d.time * 1000).toLocaleTimeString(),
          reward: d.success - d.queue // approximate reward
        }));

        setData(formatted);
      } catch (e) {
        console.error(e);
      }
    };

    fetch();
    const interval = setInterval(fetch, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">🤖 RL Learning Curve</span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="reward" stroke="#00d68f" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}