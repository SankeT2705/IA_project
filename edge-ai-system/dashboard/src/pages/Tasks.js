import { useEffect, useState, useMemo } from "react";
import { getTasks } from "../services/api";

const STATUS_CONFIG = {
  running:   { color: "var(--neon-blue)",   badge: "badge-blue",   icon: "⚙", label: "Running"   },
  pending:   { color: "var(--neon-amber)",  badge: "badge-amber",  icon: "◷", label: "Pending"   },
  queued:    { color: "var(--neon-amber)",  badge: "badge-amber",  icon: "≡", label: "Queued"    },
  completed: { color: "var(--neon-green)",  badge: "badge-green",  icon: "✓", label: "Completed" },
  failed:    { color: "var(--neon-red)",    badge: "badge-red",    icon: "✗", label: "Failed"    },
};

const getStatus = (s) => STATUS_CONFIG[s?.toLowerCase()] || {
  color: "var(--text-muted)", badge: "badge-blue", icon: "◉", label: s || "Unknown"
};

function TaskTable({ tasks }) {
  if (tasks.length === 0) {
    return (
      <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "160px" }}>
        <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "28px", marginBottom: "10px", opacity: 0.3 }}>≡</div>
          <div style={{ fontSize: "13px" }}>No tasks match this filter</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Task ID</th>
            <th>Node</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Started</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, i) => {
            const cfg = getStatus(task.status);
            return (
              <tr key={task.task_id || i} className="fade-in" style={{ animationDelay: `${i * 0.02}s` }}>
                <td style={{ color: "var(--neon-cyan)", fontWeight: 500 }}>
                  {(task.task_id || "—").slice(0, 12)}
                </td>
                <td style={{ color: "var(--text-secondary)" }}>
                  {task.node?.replace(/_/g, " ") || "—"}
                </td>
                <td>
                  <span className={`badge ${cfg.badge}`}>
                    {cfg.icon} {cfg.label}
                  </span>
                </td>
                <td>
                  {task.priority !== undefined ? (
                    <span style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      color: task.priority > 7
                        ? "var(--neon-red)"
                        : task.priority > 4
                        ? "var(--neon-amber)"
                        : "var(--text-secondary)",
                    }}>
                      P{task.priority}
                    </span>
                  ) : "—"}
                </td>
                <td style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                  {task.started_at || task.created_at || "—"}
                </td>
                <td style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                  {task.duration ? `${task.duration}s` : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function Tasks() {
  const [tasks,  setTasks]  = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("status");

  useEffect(() => {
    const fetch = () => {
      getTasks()
        .then(res => setTasks(Array.isArray(res.data) ? res.data : []))
        .catch(console.error);
    };
    fetch();
    const t = setInterval(fetch, 2000);
    return () => clearInterval(t);
  }, []);

  const countOf = (s) => tasks.filter(t => t.status?.toLowerCase() === s).length;

  const filtered = useMemo(() => {
    let result = filter === "all" ? tasks : tasks.filter(t => t.status?.toLowerCase() === filter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        (t.task_id || "").toLowerCase().includes(q) ||
        (t.node || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [tasks, filter, search]);

  const statuses = ["all", "running", "pending", "completed", "failed"];

  const summaryStats = [
    { label: "Total",     value: tasks.length,       color: "var(--text-primary)", icon: "≡" },
    { label: "Running",   value: countOf("running"),  color: "var(--neon-blue)",   icon: "⚙" },
    { label: "Completed", value: countOf("completed"),color: "var(--neon-green)",  icon: "✓" },
    { label: "Failed",    value: countOf("failed"),   color: "var(--neon-red)",    icon: "✗" },
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
      }}>
        <span style={{ color: "var(--text-secondary)" }}>Edge AI</span>
        <span style={{ opacity: 0.4 }}>/</span>
        <span style={{ color: "var(--neon-blue)" }}>Tasks</span>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h1 style={{
          fontSize: "22px",
          fontWeight: 700,
          color: "var(--text-primary)",
          letterSpacing: "-0.01em",
          marginBottom: "4px",
        }}>
          Task Manager
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
          Monitor and track all computational tasks across the edge-cloud cluster
        </p>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "20px" }}>
        {summaryStats.map(s => (
          <div key={s.label} className="card" style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <span style={{ fontSize: "16px", color: s.color }}>{s.icon}</span>
              <span className="stat-label">{s.label}</span>
            </div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {statuses.map(s => {
          const cfg = getStatus(s);
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="btn"
              style={{
                background: filter === s ? `${s === "all" ? "rgba(59,130,246" : cfg.color.replace("var(--neon-","rgba(").replace(")",",0")},0.12)` : "transparent",
                color: filter === s ? (s === "all" ? "var(--neon-blue)" : cfg.color) : "var(--text-muted)",
                borderColor: filter === s ? "var(--border-bright)" : "var(--border-faint)",
                fontSize: "12px",
              }}
            >
              {s === "all" ? "All" : cfg.icon + " " + cfg.label}
              {s !== "all" && (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", opacity: 0.7 }}>
                  {countOf(s)}
                </span>
              )}
            </button>
          );
        })}

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search task ID or node…"
          style={{
            marginLeft: "auto",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-dim)",
            borderRadius: "7px",
            padding: "7px 14px",
            fontSize: "12px",
            color: "var(--text-primary)",
            fontFamily: "var(--font-mono)",
            outline: "none",
            width: "240px",
          }}
          onFocus={e => e.target.style.borderColor = "var(--border-bright)"}
          onBlur={e => e.target.style.borderColor = "var(--border-dim)"}
        />
      </div>

      <TaskTable tasks={filtered} />
    </div>
  );
}