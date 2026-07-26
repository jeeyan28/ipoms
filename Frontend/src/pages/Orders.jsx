import { useState, useEffect } from "react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { purchaseOrdersApi, suppliersApi, inventoryApi, approvalsApi } from "../services/api";

import "./orders.css";

const APPROVAL_STAGES = ["Draft", "Pending", "Approved", "Issued", "Rejected"];

const emptyNewOrder = {
  productId: "",
  itemName: "",
  supplierId: "",
  supplierName: "",
  quantity: "",
  unitPrice: "",
  notes: "",
};

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function Orders() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All stock");
  const [selectedOrders, setSelectedOrders] = useState([]);

  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Controls the Purchase Order Preview
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [previewStatus, setPreviewStatus] = useState("Draft");
  const [previewQuantity, setPreviewQuantity] = useState(0);
  const [previewSupplierId, setPreviewSupplierId] = useState("");
  const [previewNotes, setPreviewNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Controls the New Order form
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [newOrder, setNewOrder] = useState(emptyNewOrder);

  const loadOrders = () => {
    setLoading(true);
    setError(null);
    purchaseOrdersApi
      .list()
      .then((data) => setOrders(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
    suppliersApi.list().then(setSuppliers).catch(() => {});
    inventoryApi.list().then(setProducts).catch(() => {});
  }, []);

  const toggleOrder = (id) => {
    setSelectedOrders((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      return [...current, id];
    });
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== "All stock" && order.approval_status !== statusFilter) return false;
    if (search) {
      const term = search.toLowerCase();
      if (
        !order.item_name?.toLowerCase().includes(term) &&
        !order.po_number?.toLowerCase().includes(term) &&
        !order.supplier_name?.toLowerCase().includes(term)
      ) {
        return false;
      }
    }
    return true;
  });

  const toggleAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map((order) => order.id));
    }
  };

  const submitSelected = async () => {
    try {
      await approvalsApi.bulkSubmit(selectedOrders);
      setSelectedOrders([]);
      loadOrders();
    } catch (err) {
      alert(err.message);
    }
  };

  // Open Purchase Order Preview
  const openOrderPreview = (order) => {
    setSelectedOrder(order);
    setPreviewStatus(order.approval_status);
    setPreviewQuantity(order.quantity);
    setPreviewSupplierId(order.supplier_id || "");
    setPreviewNotes(order.notes || "");
  };

  // Close Purchase Order Preview
  const closeOrderPreview = () => {
    setSelectedOrder(null);
  };

  const saveOrderChanges = async () => {
    if (!selectedOrder) return;
    setSaving(true);
    const supplier = suppliers.find((s) => s.id === previewSupplierId);
    try {
      await purchaseOrdersApi.update(selectedOrder.id, {
        approvalStatus: previewStatus,
        quantity: previewQuantity,
        supplierName: supplier ? supplier.name : selectedOrder.supplier_name,
        notes: previewNotes,
      });
      loadOrders();
      closeOrderPreview();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Calculate estimated total for the preview
  const estimatedTotal = selectedOrder ? previewQuantity * selectedOrder.unit_price : 0;

  const handleNewOrderChange = (e) => {
    const { name, value } = e.target;
    setNewOrder((current) => {
      const next = { ...current, [name]: value };
      if (name === "productId") {
        const product = products.find((p) => p.id === value);
        if (product) {
          next.itemName = product.item;
          next.unitPrice = product.unitPrice;
        }
      }
      if (name === "supplierId") {
        const supplier = suppliers.find((s) => s.id === value);
        if (supplier) next.supplierName = supplier.name;
      }
      return next;
    });
  };

  const createOrder = async () => {
    if (!newOrder.itemName || !newOrder.quantity) {
      alert("Please choose an item and a quantity.");
      return;
    }
    try {
      await purchaseOrdersApi.create({
        productId: newOrder.productId || null,
        itemName: newOrder.itemName,
        supplierId: newOrder.supplierId || null,
        supplierName: newOrder.supplierName,
        quantity: Number(newOrder.quantity) || 0,
        unitPrice: Number(newOrder.unitPrice) || 0,
        notes: newOrder.notes,
      });
      loadOrders();
      setNewOrder(emptyNewOrder);
      setShowNewOrder(false);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="orders-page">

      <Sidebar />

      <main className="orders-content">

        <Header
          search={search}
          setSearch={setSearch}
        />


        {/* =========================
            PAGE HEADING
        ========================= */}

        <section className="orders-heading">

          <div>

            <span className="page-label">
              PROCUREMENT COMMAND CENTER
            </span>

            <h1>
              Purchase orders
            </h1>

            <p className="orders-subtitle">
              Review, adjust, submit, issue, and export procurement orders.
            </p>

          </div>


          <div className="orders-actions">

            <button
              className="secondary-action-btn"
              onClick={() => setShowNewOrder(true)}
            >
              + New order
            </button>

            <button
              className="submit-selected-btn"
              disabled={selectedOrders.length === 0}
              onClick={submitSelected}
            >
              Submit Selected
            </button>

          </div>

        </section>

        {error && <p style={{ color: "#d03443" }}>{error}</p>}
        {loading && <p>Loading purchase orders…</p>}


        {/* =========================
            ORDERS TABLE
        ========================= */}

        <section className="orders-panel">

          <div className="orders-filters">

            <input
              type="text"
              placeholder="Search items or categories"
              className="orders-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="orders-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >

              <option>All stock</option>
              <option>Draft</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Issued</option>
              <option>Rejected</option>

            </select>

          </div>


          <div className="orders-table-container">

            <table className="orders-table">

              <thead>

                <tr>

                  <th className="checkbox-column">

                    <input
                      type="checkbox"
                      checked={
                        filteredOrders.length > 0 &&
                        selectedOrders.length === filteredOrders.length
                      }
                      onChange={toggleAll}
                    />

                  </th>

                  <th>PO NUMBER</th>
                  <th>ITEM</th>
                  <th>SUPPLIER</th>
                  <th>QTY</th>
                  <th>TOTAL</th>
                  <th>APPROVAL</th>
                  <th>DELIVERY</th>
                  <th>ACTION</th>

                </tr>

              </thead>


              <tbody>

                {filteredOrders.map((order) => (

                  <tr key={order.id}>

                    <td className="checkbox-column">

                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => toggleOrder(order.id)}
                      />

                    </td>


                    <td>

                      <div className="po-number">

                        <strong>
                          {order.po_number}
                        </strong>

                        <span>
                          {formatDate(order.created_at)}
                        </span>

                      </div>

                    </td>


                    <td>
                      {order.item_name}
                    </td>


                    <td>
                      {order.supplier_name}
                    </td>


                    <td>
                      {order.quantity}
                    </td>


                    <td>
                      ₱{Number(order.total).toLocaleString()}
                    </td>


                    <td>

                      <span
                        className={`approval-badge approval-${order.approval_status.toLowerCase()}`}
                      >
                        {order.approval_status}
                      </span>

                    </td>


                    <td>

                      <span className="delivery-badge">
                        {order.delivery_status}
                      </span>

                    </td>


                    <td>

                      <button
                        className="view-btn"
                        onClick={() => openOrderPreview(order)}
                      >
                        View
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </section>


        {/* =========================
            NEW ORDER FORM
        ========================= */}

        {showNewOrder && (

          <div className="order-preview-overlay">

            <div className="order-preview">

              <div className="order-preview-header">

                <h2>New purchase order</h2>

                <button
                  className="order-preview-close"
                  onClick={() => setShowNewOrder(false)}
                >
                  ×
                </button>

              </div>

              <div className="order-preview-card">

                <div className="preview-field">
                  <label>Item</label>

                  <select
                    name="productId"
                    value={newOrder.productId}
                    onChange={handleNewOrderChange}
                  >
                    <option value="">Custom item…</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.item}
                      </option>
                    ))}
                  </select>
                </div>

                {!newOrder.productId && (
                  <div className="preview-field">
                    <label>Item name</label>
                    <input
                      type="text"
                      name="itemName"
                      value={newOrder.itemName}
                      onChange={handleNewOrderChange}
                    />
                  </div>
                )}

                <div className="preview-two-column">

                  <div className="preview-field">
                    <label>Quantity</label>
                    <input
                      type="number"
                      min="1"
                      name="quantity"
                      value={newOrder.quantity}
                      onChange={handleNewOrderChange}
                    />
                  </div>

                  <div className="preview-field">
                    <label>Supplier</label>
                    <select
                      name="supplierId"
                      value={newOrder.supplierId}
                      onChange={handleNewOrderChange}
                    >
                      <option value="">Select supplier</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>

                </div>

                <div className="preview-field">
                  <label>Unit price (₱)</label>
                  <input
                    type="number"
                    min="0"
                    name="unitPrice"
                    value={newOrder.unitPrice}
                    onChange={handleNewOrderChange}
                  />
                </div>

                <div className="preview-field preview-notes">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    value={newOrder.notes}
                    onChange={handleNewOrderChange}
                  />
                </div>

              </div>

              <div className="modal-actions">

                <button
                  className="modal-cancel-btn"
                  onClick={() => setShowNewOrder(false)}
                >
                  Cancel
                </button>

                <button
                  className="modal-save-btn"
                  onClick={createOrder}
                >
                  Create draft order
                </button>

              </div>

            </div>

          </div>

        )}


        {/* =========================
            PURCHASE ORDER PREVIEW
        ========================= */}

        {selectedOrder && (

          <div className="order-preview-overlay">

            <div className="order-preview">

              {/* HEADER */}

              <div className="order-preview-header">

                <h2>
                  Purchase order preview
                </h2>

                <button
                  className="order-preview-close"
                  onClick={closeOrderPreview}
                >
                  ×
                </button>

              </div>


              {/* PREVIEW CARD */}

              <div className="order-preview-card">

                <span className="preview-po-number">
                  {selectedOrder.po_number}
                </span>

                <h3>
                  {selectedOrder.item_name}
                </h3>


                {/* STATUS */}

                <div className="preview-status">

                  {APPROVAL_STAGES.map((stage) => (
                    <button
                      key={stage}
                      className={
                        previewStatus === stage
                          ? "preview-status-active"
                          : "preview-status-btn"
                      }
                      onClick={() => setPreviewStatus(stage)}
                    >
                      {stage}
                    </button>
                  ))}

                </div>


                {/* QUANTITY + SUPPLIER */}

                <div className="preview-two-column">

                  <div className="preview-field">

                    <label>
                      Quantity
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={previewQuantity}
                      onChange={(e) =>
                        setPreviewQuantity(Number(e.target.value))
                      }
                    />

                  </div>


                  <div className="preview-field">

                    <label>
                      Supplier
                    </label>

                    <select
                      value={previewSupplierId}
                      onChange={(e) => setPreviewSupplierId(e.target.value)}
                    >
                      <option value="">{selectedOrder.supplier_name}</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>

                  </div>

                </div>


                {/* UNIT PRICE */}

                <div className="preview-price">

                  <span>
                    Unit price
                  </span>

                  <strong>
                    ₱{Number(selectedOrder.unit_price).toLocaleString()}
                  </strong>

                </div>


                {/* ESTIMATED TOTAL */}

                <div className="preview-total">

                  <span>
                    Estimated Total
                  </span>

                  <strong>
                    ₱{estimatedTotal.toLocaleString()}
                  </strong>

                </div>


                {/* NOTES */}

                <div className="preview-field preview-notes">

                  <label>
                    Notes
                  </label>

                  <textarea
                    placeholder="Replenishment order."
                    value={previewNotes}
                    onChange={(e) => setPreviewNotes(e.target.value)}
                  />

                </div>

                <div className="modal-actions">

                  <button
                    className="modal-cancel-btn"
                    onClick={closeOrderPreview}
                  >
                    Cancel
                  </button>

                  <button
                    className="modal-save-btn"
                    onClick={saveOrderChanges}
                    disabled={saving}
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </button>

                </div>

              </div>

            </div>

          </div>

        )}

      </main>

    </div>
  );
}

export default Orders;
