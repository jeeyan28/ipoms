import "./reorder.css";
import "../styles/widget.css";
import { FiRefreshCw } from "react-icons/fi";

function Reorder({ items = [], onRefresh }) {
  return (
    <div className="panel">

      <div className="panel-header">

        <div>

          <h2>Re-order Radar</h2>

          <p>
            Inventory at or below its configured minimum.
          </p>

        </div>

        <button className="refresh-btn" onClick={onRefresh}>

          <FiRefreshCw />

        </button>

      </div>

      <div className="inventory-list">

        {items.length === 0 && (
          <p style={{ padding: "0.5rem 0" }}>Nothing needs reordering right now.</p>
        )}

        {items.map((item) => (

          <div
            className="inventory-item"
            key={item.id}
          >

            <div>

              <h3>{item.name}</h3>

              <span>{item.stock} left</span>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default Reorder;