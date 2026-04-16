export default function NodeCard({ name, data }) {
  if (!data) return null;

  const load = (data.running || 0) + (data.queue || 0);
  const pct  = Math.min(load * 20, 100);
  const trust = Math.round((data.trust || 0) * 100);

  const status = load >= 4
    ? { label: "Critical", color: "var(--neon-red)",   badge: "badge-red",   cls: "critical" }
    : load >= 2
    ? { label: "Warning",  color: "var(--neon-amber)", badge: "badge-amber", cls: "warning"  }
    : { label: "Healthy",  color: "var(--neon-green)", badge: "badge-green", cls: "healthy"  };

  return (
    <div className={`node-card ${status.cls}`}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          fontWeight: 600,
          color: "var(--text-primary)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}>
          {name.replace(/_/g, " ")}
        </div>
        <span className={`badge ${status.badge}`}>{status.label}</span>
      </div>

      <div style={{ display: "flex", gap: "16px", marginBottom: "12px" }}>
        <div>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: "20px",
            fontWeight: 700,
            color: "var(--neon-green)",
          }}>
            {data.running || 0}
          </div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase" }}>Running</div>
        </div>
        <div>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: "20px",
            fontWeight: 700,
            color: "var(--neon-amber)",
          }}>
            {data.queue || 0}
          </div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase" }}>Queued</div>
        </div>
      </div>

      <div style={{ marginBottom: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Load</span>
          <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: status.color }}>{pct}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${status.color}55, ${status.color})`,
          }} />
        </div>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Trust</span>
          <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--neon-violet)" }}>{trust}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{
            width: `${trust}%`,
            background: "linear-gradient(90deg, rgba(139,92,246,0.4), var(--neon-violet))",
          }} />
        </div>
      </div>
    </div>
  );
}