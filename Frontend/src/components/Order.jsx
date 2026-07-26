import "./order.css";
import "../styles/widget.css";

const STAGE_COLORS = {
  Draft: "#9aa39e",
  Pending: "#f6c453",
  Approved: "#14774f",
  Issued: "#6d3bd1",
};

function Order({ orders = [] }) {
  const orderData = Object.entries(STAGE_COLORS).map(([label, color]) => ({
    label,
    color,
    value: orders.filter((order) => order.approval_status === label).length,
  }));

  const maxValue = Math.max(1, ...orderData.map((item) => item.value));

  return (
    <div className="panel">

      <h2>Order Pulse</h2>

      <p>Purchase order activity by workflow stage.</p>

      <div className="order-chart">

        {orderData.map((item) => (

          <div
            className="chart-row"
            key={item.label}
          >

            <span className="chart-label">
              {item.label}
            </span>

            <div className="chart-bar-bg">

              <div
                className="chart-bar"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  background: item.color,
                }}
              ></div>

            </div>

            <span className="chart-value">
              {item.value}
            </span>

          </div>

        ))}

      </div>

    </div>
  );
}

export default Order;