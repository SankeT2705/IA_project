export default function NodeCard({ name, data }) {
  return (
    <div className="card">
      <h3>{name}</h3>
      <p>Running: {data.running}</p>
      <p>Queue: {data.queue}</p>
      <p>Trust: {data.trust.toFixed(2)}</p>
    </div>
  );
}