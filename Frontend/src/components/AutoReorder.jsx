import { useState } from "react";
import { purchaseOrdersApi } from "../services/api";

import "./autoreorder.css";

function AutoReorder({ items = [], suppliers = [], onCreated }) {
  const [creating, setCreating] = useState(false);

  const createDraftOrders = async () => {
    setCreating(true);
    try {
      for (const item of items) {
        const supplier = suppliers.find((s) => s.id === item.supplier_id);
        await purchaseOrdersApi.create({
          productId: item.id,
          itemName: item.name,
          supplierId: item.supplier_id || null,
          supplierName: supplier ? supplier.name : "Preferred supplier",
          quantity: item.reorder_point || item.minimum,
          unitPrice: item.price,
          notes: "Auto-generated from dashboard reorder review.",
        });
      }
      onCreated?.();
    } catch (err) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className="auto-reorder">

      <div className="auto-reorder-header">
        <h2>Automatic reorder review</h2>

        <p>
          Review suggested reorder items and create draft purchase orders.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="reorder-message">
          No low-stock items are currently due for reorder.
        </div>
      ) : (
        <div className="reorder-message">
          {items.length} item{items.length === 1 ? "" : "s"} at or below minimum stock.
        </div>
      )}

      <div className="auto-reorder-actions">

        <button className="cancel-reorder-btn" disabled={creating}>
          Cancel
        </button>

        <button
          className="create-orders-btn"
          onClick={createDraftOrders}
          disabled={creating || items.length === 0}
        >
          {creating ? "Creating…" : "Create draft orders"}
        </button>

      </div>

    </section>
  );
}

export default AutoReorder;