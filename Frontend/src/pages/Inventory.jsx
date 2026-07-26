import { useState, useEffect } from "react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { inventoryApi, suppliersApi, purchaseOrdersApi } from "../services/api";

import "./inventory.css";

const emptyForm = {
  item: "",
  category: "",
  onHand: "",
  minimum: "",
  reorder: "",
  unitPrice: "",
  supplierId: "",
};

function Inventory() {
  const [showItemForm, setShowItemForm] = useState(false);
  const [showReorderReview, setShowReorderReview] = useState(false);
  const [creatingDrafts, setCreatingDrafts] = useState(false);

  const [stockFilter, setStockFilter] = useState("All stock");
  const [search, setSearch] = useState("");

  const [inventoryItems, setInventoryItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const loadInventory = () => {
    setLoading(true);
    setError(null);
    inventoryApi
      .list()
      .then((data) => setInventoryItems(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInventory();
    suppliersApi.list().then(setSuppliers).catch(() => {});
  }, []);

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const openAddForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowItemForm(true);
  };

  const openEditForm = (item) => {
    setFormData({
      item: item.item || "",
      category: item.category || "",
      onHand: item.onHand ?? "",
      minimum: item.minimum ?? "",
      reorder: item.reorder ?? "",
      unitPrice: item.unitPrice ?? "",
      supplierId: item.supplierId || "",
    });
    setEditingId(item.id);
    setShowItemForm(true);
  };

  const saveItem = async () => {
    if (!formData.item || !formData.category) {
      return;
    }

    const payload = {
      item: formData.item,
      category: formData.category,
      onHand: Number(formData.onHand || 0),
      minimum: Number(formData.minimum || 0),
      reorder: Number(formData.reorder || 0),
      unitPrice: Number(formData.unitPrice || 0),
      supplierId: formData.supplierId || null,
    };

    try {
      if (editingId) {
        await inventoryApi.update(editingId, payload);
      } else {
        await inventoryApi.create(payload);
      }
      loadInventory();
    } catch (err) {
      alert(err.message);
      return;
    }

    setFormData(emptyForm);
    setEditingId(null);
    setShowItemForm(false);
  };

  const filteredItems = inventoryItems.filter((item) => {
    if (stockFilter === "Low stock" && !item.lowStock) return false;
    if (stockFilter === "Healthy" && item.lowStock) return false;
    if (search) {
      const term = search.toLowerCase();
      if (
        !item.item?.toLowerCase().includes(term) &&
        !item.category?.toLowerCase().includes(term)
      ) {
        return false;
      }
    }
    return true;
  });

  const lowStockItems = inventoryItems.filter((item) => item.lowStock);

  const createDraftOrders = async () => {
    setCreatingDrafts(true);
    try {
      for (const item of lowStockItems) {
        await purchaseOrdersApi.create({
          productId: item.id,
          itemName: item.item,
          supplierId: item.supplierId,
          supplierName: item.supplier,
          quantity: item.reorder,
          unitPrice: item.unitPrice,
          notes: "Auto-generated from reorder review.",
        });
      }
      setShowReorderReview(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setCreatingDrafts(false);
    }
  };

  return (
    <div className="inventory-page">

      <Sidebar />

      <main className="inventory-content">

        <Header search={search} setSearch={setSearch} />

        <div className="inventory-heading">

          <span className="page-label">
            PROCUREMENT COMMAND CENTER
          </span>

          <h1>Inventory Control</h1>

          <p className="inventory-subtitle">
            Monitor stock, thresholds, preferred suppliers, and reorder quantities.
          </p>

          <div className="inventory-actions">

            <button
              className="reorder-scan-btn"
              onClick={() => setShowReorderReview(true)}
            >
              Run re-order scan
            </button>

            <button
              className="add-item-btn"
              onClick={openAddForm}
            >
              + Add item
            </button>

          </div>

        </div>

        {error && <p style={{ color: "#d03443" }}>{error}</p>}
        {loading && <p>Loading inventory…</p>}

        <section className="inventory-panel">

          <div className="inventory-filters">

            <input
              type="text"
              placeholder="Search items or categories"
              className="inventory-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="stock-filter"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option>All stock</option>
              <option>Low stock</option>
              <option>Healthy</option>
            </select>

          </div>

          <div className="inventory-table-container">

            <table className="inventory-table">

              <thead>
                <tr>
                  <th>ITEM</th>
                  <th>CATEGORY</th>
                  <th>ON HAND</th>
                  <th>MINIMUM</th>
                  <th>RE-ORDER</th>
                  <th>VALUE</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>

                {filteredItems.map((item) => (

                  <tr key={item.id}>

                    <td>
                      <div className="item-info">
                        <strong>{item.item}</strong>
                        <span>{item.supplier || "No preferred supplier"}</span>
                      </div>
                    </td>

                    <td>{item.category}</td>

                    <td>{item.onHand}</td>

                    <td>{item.minimum}</td>

                    <td>{item.reorder}</td>

                    <td>₱{Number(item.value).toLocaleString()}</td>

                    <td>

                      <span
                        className={`status-badge ${
                          item.lowStock ? "low-stock" : "in-stock"
                        }`}
                      >
                        {item.lowStock ? "Low Stock" : "Healthy"}
                      </span>

                    </td>

                    <td>

                      <button
                        className="edit-btn"
                        onClick={() => openEditForm(item)}
                      >
                        Edit
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </section>

        {showReorderReview && (

          <section className="automatic-reorder">

            <h2>Automatic reorder review</h2>

            <p>
              Review suggested quantities and estimated values before creating drafts.
            </p>

            {lowStockItems.length === 0 && (
              <p>No low-stock items are currently due for reorder.</p>
            )}

            {lowStockItems.map((item) => (

              <div
                className="reorder-review-item"
                key={item.id}
              >

                <div>
                  <strong>{item.item}</strong>

                  <span>
                    {item.onHand} on hand · minimum {item.minimum}
                  </span>
                </div>

                <strong>
                  {item.reorder} units
                </strong>

              </div>

            ))}

            <div className="reorder-review-actions">

              <button
                className="cancel-review-btn"
                onClick={() => setShowReorderReview(false)}
              >
                Cancel
              </button>

              <button
                className="create-draft-btn"
                onClick={createDraftOrders}
                disabled={creatingDrafts || lowStockItems.length === 0}
              >
                {creatingDrafts ? "Creating…" : "Create draft orders"}
              </button>

            </div>

          </section>

        )}

      </main>

      {showItemForm && (

        <div
          className="inventory-modal-overlay"
          onClick={() => setShowItemForm(false)}
        >

          <div
            className="inventory-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="modal-header">

              <h2>{editingId ? "Edit inventory item" : "Inventory item"}</h2>

              <button
                className="modal-close"
                onClick={() => setShowItemForm(false)}
              >
                ×
              </button>

            </div>

            <div className="inventory-form">

              <div className="form-row">

                <div className="form-group">
                  <label>Item name</label>

                  <input
                    name="item"
                    value={formData.item}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>

                  <input
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                  />
                </div>

              </div>

              <div className="form-row">

                <div className="form-group">
                  <label>Current stock</label>

                  <input
                    type="number"
                    name="onHand"
                    value={formData.onHand}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label>Minimum stock</label>

                  <input
                    type="number"
                    name="minimum"
                    value={formData.minimum}
                    onChange={handleFormChange}
                  />
                </div>

              </div>

              <div className="form-row">

                <div className="form-group">
                  <label>Reorder quantity</label>

                  <input
                    type="number"
                    name="reorder"
                    value={formData.reorder}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label>Unit price (₱)</label>

                  <input
                    type="number"
                    name="unitPrice"
                    value={formData.unitPrice}
                    onChange={handleFormChange}
                  />
                </div>

              </div>

              <div className="form-group full-width">
                <label>Preferred supplier</label>

                <select
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleFormChange}
                >
                  <option value="">No preferred supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <div className="modal-actions">

              <button
                className="modal-cancel-btn"
                onClick={() => setShowItemForm(false)}
              >
                Cancel
              </button>

              <button
                className="modal-save-btn"
                onClick={saveItem}
              >
                {editingId ? "Save changes" : "Add item"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Inventory;
