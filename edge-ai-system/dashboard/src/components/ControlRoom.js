export default function ControlRoom({ nodes }) {
  const getStatus = (load) => {
    if (load < 2) return { label: "Healthy",  cls: "healthy",  color: "#00d68f", bg: "rgba(0,214,143,0.08)" };
    if (load < 4) return { label: "Warning",  cls: "warning",  color: "#f59e0b", bg: "rgba(245,158,11,0.08)" };
    return            { label: "Critical", cls: "critical", color: "#f43f5e", bg: "rgba(244,63,94,0.08)" };
  };

  const nodeIcons = { edge_1: "◈", edge_2: "◈", cloud: "☁" };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">
          <span className="card-title-icon">◈</span>
          Node Status
        </span>
        <span className="badge badge-green">
          <span className="pulse pulse-green" style={{ width: 6, height: 6 }} />
          Live
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
        {Object.entries(nodes).map(([id, node]) => {
          const load   = node.running + node.queue;
          const status = getStatus(load);
          const pct    = Math.min(load * 20, 100);

          return (
            <div key={id} className={`node-card ${status.cls}`}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <div style={{ fontSize: "18px", marginBottom: "4px" }}>
                    {nodeIcons[id] || "◈"}
                  </div>
                  <div style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#e2e8f0",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                  }}>{id.replace("_", " ")}</div>
                </div>
                <span className={`badge badge-${status.cls === "healthy" ? "green" : status.cls === "warning" ? "amber" : "red"}`}>
                  {status.label}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                <div>
                  <div style={{ fontSize: "20px", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, color: "#00d68f" }}>
                    {node.running}
                  </div>
                  <div style={{ fontSize: "11px", color: "#8892a4", textTransform: "uppercase", letterSpacing: "0.05em" }}>Running</div>
                </div>
                <div>
                  <div style={{ fontSize: "20px", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, color: "#f59e0b" }}>
                    {node.queue}
                  </div>
                  <div style={{ fontSize: "11px", color: "#8892a4", textTransform: "uppercase", letterSpacing: "0.05em" }}>Queued</div>
                </div>
              </div>

              <div style={{ marginBottom: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "11px", color: "#8892a4" }}>Load</span>
                  <span style={{ fontSize: "11px", fontFamily: "'IBM Plex Mono', monospace", color: status.color }}>
                    {pct.toFixed(0)}%
                  </span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${status.color}99, ${status.color})`
                  }} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", color: "#8892a4" }}>Trust</span>
                <span style={{
                  fontSize: "12px",
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: "#a78bfa"
                }}>
                  {(node.trust * 100).toFixed(0)}%
                </span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{
                  width: `${node.trust * 100}%`,
                  background: "linear-gradient(90deg, #7c3aed88, #a78bfa)"
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}