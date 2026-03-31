import { useEffect, useState } from "react";
import { getTasks } from "../services/api";
import TaskTable from "../components/TaskTable";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchData = () => {
      getTasks().then(res => setTasks(res.data)).catch(console.error);
    };
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const statuses = ["all", "running", "pending", "completed", "failed"];

  const filtered = filter === "all"
    ? tasks
    : tasks.filter(t => t.status === filter);

  const countByStatus = (s) => tasks.filter(t => t.status === s).length;

  return (
    <div className="page-content">
      {/* Breadcrumb */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        marginBottom: "20px",
        fontSize: "12px",
        color: "#4a5568",
        fontFamily: "'IBM Plex Mono', monospace"
      }}>
        <span style={{ color: "#8892a4" }}>Edge AI</span>
        <span>/</span>
        <span style={{ color: "#e2e8f0" }}>Tasks</span>
      </div>

      {/* Summary row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "20px" }}>
        {[
          { label: "Total",     value: tasks.length,           color: "#e2e8f0" },
          { label: "Running",   value: countByStatus("running"),   color: "#f59e0b" },
          { label: "Completed", value: countByStatus("completed"), color: "#00d68f" },
          { label: "Failed",    value: countByStatus("failed"),    color: "#f43f5e" },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: "18px 20px" }}>
            <div className="stat-label" style={{ marginBottom: "8px" }}>{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="btn"
            style={{
              background: filter === s ? "rgba(0,214,143,0.12)" : undefined,
              color:      filter === s ? "#00d68f"              : undefined,
              borderColor: filter === s ? "rgba(0,214,143,0.3)" : undefined,
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {s !== "all" && (
              <span style={{
                marginLeft: "4px",
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "11px",
                opacity: 0.7
              }}>{countByStatus(s)}</span>
            )}
          </button>
        ))}
      </div>

      <TaskTable tasks={filtered} />
    </div>
  );
}