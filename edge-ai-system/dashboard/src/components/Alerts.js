import { useEffect, useState } from "react";

function generateAlert(nodes) {
  const alerts = [];
  const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  Object.entries(nodes).forEach(([id, node]) => {
    const load = node.running + node.queue;
    if (load >= 4) {
      alerts.push({ id: `${id}-critical-${Date.now()}`, severity: "critical", node: id, message: `High load detected: ${load} tasks`, time: now });
    } else if (load >= 2) {
      alerts.push({ id: `${id}-warn-${Date.now()}`, severity: "warning", node: id, message: `Elevated load: ${load} tasks`, time: now });
    }
    if (node.trust < 0.5) {
      alerts.push({ id: `${id}-trust-${Date.now()}`, severity: "warning", node: id, message: `Trust score low: ${(node.trust * 100).toFixed(0)}%`, time: now });
    }
  });

  return alerts;
}

export default function Alerts({ nodes }) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const newAlerts = generateAlert(nodes);
    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 12));
    }
  }, [nodes]);

  const severityMap = {
    critical: { badge: "badge-red",   icon: "⚠", label: "Critical" },
    warning:  { badge: "badge-amber", icon: "◉", label: "Warning"  },
    info:     { badge: "badge-blue",  icon: "ℹ", label: "Info"     },
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">
          <span className="card-title-icon">⚠</span>
          Alerts & Events
        </span>
        {alerts.length > 0 && (
          <span className="badge badge-red">{alerts.length}</span>
        )}
      </div>

      <div style={{ maxHeight: "320px", overflowY: "auto", paddingRight: "4px" }}>
        {alerts.length === 0 ? (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "120px",
            color: "#4a5568",
          }}>
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>✓</div>
            <div style={{ fontSize: "13px" }}>No active alerts</div>
          </div>
        ) : (
          alerts.map((alert) => {
            const s = severityMap[alert.severity] || severityMap.info;
            return (
              <div key={alert.id} className="alert-item fade-in">
                <div style={{ marginTop: "1px", fontSize: "14px" }}>{s.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                    <span className={`badge ${s.badge}`}>{s.label}</span>
                    <span style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "11px",
                      color: "#8892a4",
                      background: "rgba(255,255,255,0.05)",
                      padding: "1px 6px",
                      borderRadius: "3px"
                    }}>{alert.node}</span>
                  </div>
                  <div style={{ fontSize: "13px", color: "#c8d0dc", marginBottom: "2px" }}>
                    {alert.message}
                  </div>
                  <div style={{ fontSize: "11px", fontFamily: "'IBM Plex Mono', monospace", color: "#4a5568" }}>
                    {alert.time}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}