import { useMemo, useState } from "react";

const SEVERITY_RULES = [
  {
    test: (id, node) => (node.running || 0) + (node.queue || 0) >= 4,
    severity: "critical",
    color: "var(--neon-red)",
    bgColor: "rgba(239,68,68,0.08)",
    borderColor: "rgba(239,68,68,0.2)",
    icon: "⚠",
    getMessage: (id) => `Node ${id.replace(/_/g, " ")} is critically overloaded`,
  },
  {
    test: (id, node) => (node.trust || 0) < 0.4,
    severity: "warning",
    color: "var(--neon-amber)",
    bgColor: "rgba(245,158,11,0.07)",
    borderColor: "rgba(245,158,11,0.18)",
    icon: "▲",
    getMessage: (id, node) => `Low trust score on ${id.replace(/_/g, " ")}: ${Math.round((node.trust || 0) * 100)}%`,
  },
  {
    test: (id, node) => (node.queue || 0) >= 3,
    severity: "warning",
    color: "var(--neon-amber)",
    bgColor: "rgba(245,158,11,0.07)",
    borderColor: "rgba(245,158,11,0.18)",
    icon: "⬡",
    getMessage: (id, node) => `High queue depth on ${id.replace(/_/g, " ")}: ${node.queue} tasks`,
  },
  {
    test: (id, node) => (node.running || 0) === 0 && (node.queue || 0) === 0,
    severity: "info",
    color: "var(--neon-blue)",
    bgColor: "rgba(59,130,246,0.06)",
    borderColor: "rgba(59,130,246,0.15)",
    icon: "◉",
    getMessage: (id) => `Node ${id.replace(/_/g, " ")} is idle — no active workload`,
  },
];

export default function Alerts({ nodes = {} }) {
  const [filter, setFilter] = useState("all");

  const alerts = useMemo(() => {
    const result = [];
    Object.entries(nodes).forEach(([id, node]) => {
      SEVERITY_RULES.forEach(rule => {
        if (rule.test(id, node)) {
          result.push({
            id: `${id}-${rule.severity}-${rule.icon}`,
            node: id,
            severity: rule.severity,
            message: rule.getMessage(id, node),
            color: rule.color,
            bgColor: rule.bgColor,
            borderColor: rule.borderColor,
            icon: rule.icon,
            timestamp: new Date().toLocaleTimeString([], { hour12: false }),
          });
        }
      });
    });
    return result.sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2 };
      return order[a.severity] - order[b.severity];
    });
  }, [nodes]);

  const filtered = filter === "all" ? alerts : alerts.filter(a => a.severity === filter);
  const countOf  = (s) => alerts.filter(a => a.severity === s).length;

  const filterTabs = [
    { key: "all",      label: "All",      count: alerts.length },
    { key: "critical", label: "Critical", count: countOf("critical") },
    { key: "warning",  label: "Warning",  count: countOf("warning")  },
    { key: "info",     label: "Info",     count: countOf("info")     },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">
          ⚠ System Alerts
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {countOf("critical") > 0 && (
            <span className="badge badge-red">
              <span className="pulse pulse-red" />
              {countOf("critical")} Critical
            </span>
          )}
          {alerts.length === 0 && (
            <span className="badge badge-green">All Clear</span>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "5px", marginBottom: "14px" }}>
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className="btn"
            style={{
              padding: "4px 10px",
              fontSize: "11px",
              background: filter === tab.key ? "rgba(59,130,246,0.12)" : "transparent",
              color: filter === tab.key ? "var(--neon-blue)" : "var(--text-muted)",
              borderColor: filter === tab.key ? "rgba(59,130,246,0.3)" : "var(--border-faint)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {tab.label}
            {tab.count > 0 && (
              <span style={{ marginLeft: "4px", opacity: 0.7 }}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      <div style={{ maxHeight: "360px", overflowY: "auto", paddingRight: "2px" }}>
        {filtered.length === 0 ? (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "120px",
            color: "var(--text-muted)",
            gap: "10px",
          }}>
            <div style={{ fontSize: "26px", opacity: 0.25 }}>✓</div>
            <div style={{ fontSize: "13px" }}>
              {alerts.length === 0 ? "All systems nominal" : `No ${filter} alerts`}
            </div>
          </div>
        ) : (
          filtered.map((alert, i) => (
            <div
              key={alert.id}
              className="alert-item fade-in"
              style={{
                background: alert.bgColor,
                borderColor: alert.borderColor,
                animationDelay: `${i * 0.04}s`,
              }}
            >
              {/* Icon */}
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: `${alert.color}15`,
                border: `1px solid ${alert.color}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                color: alert.color,
                flexShrink: 0,
              }}>
                {alert.icon}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: "12px",
                  color: "var(--text-primary)",
                  marginBottom: "4px",
                  lineHeight: 1.4,
                }}>
                  {alert.message}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    color: alert.color,
                    background: `${alert.color}12`,
                    border: `1px solid ${alert.color}20`,
                    padding: "1px 6px",
                    borderRadius: "3px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}>
                    {alert.severity}
                  </span>
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    color: "var(--text-muted)",
                  }}>
                    {alert.timestamp}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}