import { useMemo } from "react";

export default function SystemHealth({ nodes = {} }) {
  const entries = Object.entries(nodes);

  const metrics = useMemo(() => {
    if (entries.length === 0) return null;
    const totalRunning  = entries.reduce((s, [, n]) => s + (n.running || 0), 0);
    const totalQueued   = entries.reduce((s, [, n]) => s + (n.queue || 0), 0);
    const avgTrust      = entries.reduce((s, [, n]) => s + (n.trust || 0), 0) / entries.length;
    const criticalNodes = entries.filter(([, n]) => (n.running + n.queue) >= 4).length;
    const healthyNodes  = entries.filter(([, n]) => (n.running + n.queue) < 2).length;
    const utilization   = Math.min(((totalRunning + totalQueued) / (entries.length * 5)) * 100, 100);

    return { totalRunning, totalQueued, avgTrust, criticalNodes, healthyNodes, utilization };
  }, [nodes]);

  if (!metrics) return null;

  const overallHealth = metrics.criticalNodes > 0
    ? { label: "Degraded", color: "var(--neon-amber)", icon: "⚠" }
    : metrics.avgTrust > 0.8
    ? { label: "Optimal",  color: "var(--neon-green)", icon: "✓" }
    : { label: "Normal",   color: "var(--neon-blue)",  icon: "◉" };

  const items = [
    { label: "System Health",  value: overallHealth.label, color: overallHealth.color, icon: overallHealth.icon },
    { label: "Utilization",    value: `${metrics.utilization.toFixed(0)}%`, color: "var(--neon-blue)",   icon: "▣" },
    { label: "Healthy Nodes",  value: metrics.healthyNodes,   color: "var(--neon-green)",  icon: "◈" },
    { label: "Critical Nodes", value: metrics.criticalNodes,  color: "var(--neon-red)",    icon: "⚡" },
    { label: "Avg Trust",      value: `${(metrics.avgTrust * 100).toFixed(0)}%`, color: "var(--neon-violet)", icon: "◎" },
  ];

  return (
    <div style={{
      display: "flex",
      alignItems: "stretch",
      gap: "0",
      background: "var(--bg-elevated)",
      border: "1px solid var(--border-dim)",
      borderRadius: "var(--r-lg)",
      overflow: "hidden",
    }}>
      {items.map((item, i) => (
        <div
          key={item.label}
          style={{
            flex: 1,
            padding: "14px 18px",
            borderRight: i < items.length - 1 ? "1px solid var(--border-faint)" : "none",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            transition: "background 0.2s",
            cursor: "default",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <div style={{
            width: "32px", height: "32px",
            borderRadius: "8px",
            background: `${item.color}12`,
            border: `1px solid ${item.color}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
            color: item.color,
            flexShrink: 0,
          }}>
            {item.icon}
          </div>
          <div>
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: "16px",
              fontWeight: 700,
              color: item.color,
              lineHeight: 1,
              marginBottom: "3px",
            }}>
              {item.value}
            </div>
            <div style={{
              fontSize: "10px",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}>
              {item.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}