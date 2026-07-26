import "./statcard.css";

function StatCard({
  title,
  value,
  description,
  warning,
  icon,
  color,
}) {
  return (
    <div className="stat-card">

      <div
        className="stat-icon"
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>

      <div className="card-content">

        <h3>{title}</h3>

        <h2>{value}</h2>

        <p className={warning ? "warning" : ""}>
          {description}
        </p>

      </div>

    </div>
  );
}

export default StatCard;