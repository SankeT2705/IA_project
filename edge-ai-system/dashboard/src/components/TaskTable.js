export default function TaskTable({ tasks }) {
  const statusMap = {
    completed: { badge: "badge-green", icon: "✓", label: "Completed" },
    failed:    { badge: "badge-red",   icon: "✗", label: "Failed"    },
    running:   { badge: "badge-amber", icon: "⟳", label: "Running"   },
    pending:   { badge: "badge-blue",  icon: "◌", label: "Pending"   },
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">
          <span className="card-title-icon">≡</span>
          Task Logs
        </span>
        <span style={{
          fontSize: "12px",
          fontFamily: "'IBM Plex Mono', monospace",
          color: "#8892a4"
        }}>
          {tasks.length} records
        </span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Task ID</th>
              <th>Status</th>
              <th>Node</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", color: "#4a5568", padding: "24px" }}>
                  No tasks found
                </td>
              </tr>
            ) : (
              tasks.map(t => {
                const s = statusMap[t.status] || statusMap.pending;
                return (
                  <tr key={t.task_id} className="fade-in">
                    <td>
                      <span style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: "12px",
                        background: "rgba(255,255,255,0.05)",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        color: "#e2e8f0"
                      }}>
                        {t.task_id.slice(0, 8)}…
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${s.badge}`}>
                        {s.icon} {s.label}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: "12px",
                        color: "#0ea5e9"
                      }}>
                        {t.node}
                      </span>
                    </td>
                    <td style={{ color: "#4a5568", fontSize: "12px" }}>
                      {t.created_at
                        ? new Date(t.created_at).toLocaleTimeString()
                        : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}