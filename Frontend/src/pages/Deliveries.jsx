import { useState, useEffect } from "react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { deliveriesApi } from "../services/api";

import "./deliveries.css";

const STAGES = ["Ordered", "In-Transit", "Shipped", "Delivered"];

function nextStage(current) {
  const index = STAGES.indexOf(current);
  if (index === -1 || index === STAGES.length - 1) return current;
  return STAGES[index + 1];
}

function DeliveryCard({ order, onUpdated }) {
  const [receivedQuantity, setReceivedQuantity] = useState("");
  const [discrepancyNotes, setDiscrepancyNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const isDelayed = order.delivery_status === "Delayed";
  const stageIndex = Math.max(STAGES.indexOf(order.delivery_status), 0);

  const advanceStatus = async () => {
    setSaving(true);
    try {
      await deliveriesApi.update(order.id, {
        status: nextStage(order.delivery_status === "Delayed" ? "Ordered" : order.delivery_status),
        receivedQuantity: receivedQuantity ? Number(receivedQuantity) : undefined,
        discrepancyNotes: discrepancyNotes || undefined,
      });
      onUpdated();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const flagDelay = async () => {
    setSaving(true);
    try {
      await deliveriesApi.update(order.id, {
        status: "Delayed",
        discrepancyNotes: discrepancyNotes || "Delivery delayed.",
      });
      onUpdated();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="delivery-card">

      <div className="delivery-card-header">

        <div>

          <span className="delivery-po">
            {order.po_number} · {order.supplier_name}
          </span>

          <h2>{order.item_name}</h2>

        </div>

        <span className={isDelayed ? "delayed-badge" : "delivery-badge"}>
          {order.delivery_status}
        </span>

      </div>

      <div className="delivery-progress">

        <div className="progress-line"></div>

        {STAGES.map((stage, index) => (
          <div className="milestone" key={stage}>
            <span className="milestone-dot">
              {index <= stageIndex && order.delivery_status !== "Delayed" ? "✓" : index + 1}
            </span>
            <span>{stage}</span>
          </div>
        ))}

      </div>

      <div className="delivery-inputs">

        <div className="delivery-field">

          <label htmlFor={`received-quantity-${order.id}`}>
            RECEIVED QUANTITY
          </label>

          <input
            id={`received-quantity-${order.id}`}
            type="number"
            value={receivedQuantity}
            onChange={(e) => setReceivedQuantity(e.target.value)}
          />

        </div>

        <div className="delivery-field">

          <label htmlFor={`discrepancy-notes-${order.id}`}>
            DISCREPANCY NOTES
          </label>

          <input
            id={`discrepancy-notes-${order.id}`}
            type="text"
            value={discrepancyNotes}
            onChange={(e) => setDiscrepancyNotes(e.target.value)}
          />

        </div>

      </div>

      <div className="delivery-actions">

        <button
          className="advance-status-btn"
          onClick={advanceStatus}
          disabled={saving || order.delivery_status === "Delivered"}
        >
          {order.delivery_status === "Delivered" ? "Delivered" : "Advance status"}
        </button>

        <button
          className="flag-delay-btn"
          onClick={flagDelay}
          disabled={saving || order.delivery_status === "Delivered"}
        >
          Flag Delay
        </button>

      </div>

    </section>
  );
}

function Deliveries() {
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDeliveries = () => {
    setLoading(true);
    setError(null);
    deliveriesApi
      .list()
      .then((data) => setOrders(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      order.item_name?.toLowerCase().includes(term) ||
      order.po_number?.toLowerCase().includes(term) ||
      order.supplier_name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="deliveries-page">

      <Sidebar />

      <main className="deliveries-content">

        <Header
          search={search}
          setSearch={setSearch}
        />

        <section className="deliveries-heading">

          <span className="page-label">
            PROCUREMENT COMMAND CENTRE
          </span>

          <h1>Delivery tracking</h1>

          <p className="deliveries-subtitle">
            Track milestones, receipts, delays, and quantity discrepancies.
          </p>

        </section>

        {error && <p style={{ color: "#d03443" }}>{error}</p>}
        {loading && <p>Loading deliveries…</p>}
        {!loading && filteredOrders.length === 0 && <p>No purchase orders yet.</p>}

        {filteredOrders.map((order) => (
          <DeliveryCard key={order.id} order={order} onUpdated={loadDeliveries} />
        ))}

      </main>

    </div>
  );
}

export default Deliveries;
