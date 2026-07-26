import { useState, useEffect } from "react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { suppliersApi } from "../services/api";

import "./suppliers.css";

const emptyForm = {
  name: "",
  category: "",
  email: "",
  phone: "",
  terms: "",
  leadTime: "",
  rating: "",
  referencePrice: "",
};

function Suppliers() {

  const [search, setSearch] = useState("");

  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [archiveSupplier, setArchiveSupplier] = useState(null);

  // Supplier list (loaded from the API)
  const [supplierList, setSupplierList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Controls Add/Edit Supplier form
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState(null);

  // New/edited supplier form
  const [newSupplier, setNewSupplier] = useState(emptyForm);

  const loadSuppliers = () => {
    setLoading(true);
    setError(null);
    suppliersApi
      .list()
      .then((data) => setSupplierList(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  // Handle form input changes
  const handleSupplierChange = (e) => {

    const { name, value } = e.target;

    setNewSupplier((current) => ({
      ...current,
      [name]: value,
    }));

  };


  // Save new or edited supplier
  const handleSaveSupplier = async () => {

    if (
      !newSupplier.name ||
      !newSupplier.category ||
      !newSupplier.email ||
      !newSupplier.phone
    ) {
      alert("Please fill in the required supplier details.");
      return;
    }

    const payload = {
      name: newSupplier.name,
      category: newSupplier.category,
      leadTime: newSupplier.leadTime
        ? `${newSupplier.leadTime} days`
        : "Not specified",
      referencePrice: Number(newSupplier.referencePrice) || 0,
      terms: newSupplier.terms || "Not specified",
      phone: newSupplier.phone,
      email: newSupplier.email,
      rating: Number(newSupplier.rating) || 0,
    };

    try {
      if (editingSupplierId) {
        await suppliersApi.update(editingSupplierId, payload);
      } else {
        await suppliersApi.create(payload);
      }
      loadSuppliers();
    } catch (err) {
      alert(err.message);
      return;
    }

    // Reset form
    setNewSupplier(emptyForm);
    setEditingSupplierId(null);
    setShowAddSupplier(false);
  };


  // Cancel Add/Edit Supplier
  const handleCancelSupplier = () => {

    setNewSupplier(emptyForm);
    setEditingSupplierId(null);
    setShowAddSupplier(false);
  };


  // Open the form pre-filled for editing
  const handleEditSupplier = (supplier) => {
    setNewSupplier({
      name: supplier.name || "",
      category: supplier.category || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      terms: supplier.terms || "",
      leadTime: (supplier.lead_time || "").replace(/\s*days?$/i, ""),
      rating: supplier.rating ?? "",
      referencePrice: supplier.reference_price ?? "",
    });
    setEditingSupplierId(supplier.id);
    setShowAddSupplier(true);
  };


  // Archive a supplier
  const handleConfirmArchive = async () => {
    try {
      await suppliersApi.remove(archiveSupplier);
      loadSuppliers();
    } catch (err) {
      alert(err.message);
    }
    setArchiveSupplier(null);
  };


  const filteredSuppliers = supplierList.filter((supplier) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      supplier.name?.toLowerCase().includes(term) ||
      supplier.category?.toLowerCase().includes(term)
    );
  });


  return (
    <div className="suppliers-page">

      <Sidebar />

      <main className="suppliers-content">

        <Header
          search={search}
          setSearch={setSearch}
        />


        {/* =========================
            PAGE HEADING
        ========================= */}

        <section className="suppliers-heading">

          <div>

            <span className="page-label">
              PROCUREMENT COMMAND CENTRE
            </span>

            <h1>Supplier network</h1>

            <p className="suppliers-subtitle">
              Manage commercial terms and compare supplier performance.
            </p>

          </div>

          <button
            className="add-supplier-btn"
            onClick={() => {
              setNewSupplier(emptyForm);
              setEditingSupplierId(null);
              setShowAddSupplier(true);
            }}
          >
            + Add supplier
          </button>

        </section>

        {error && <p style={{ color: "#d03443" }}>{error}</p>}
        {loading && <p>Loading suppliers…</p>}


        {/* =========================
            ADD/EDIT SUPPLIER FORM
        ========================= */}

        {showAddSupplier && (

          <section className="add-supplier-panel">

            <div className="add-supplier-header">

              <h2>{editingSupplierId ? "Edit supplier" : "Supplier details"}</h2>

            </div>


            <div className="supplier-form">


              {/* Supplier name */}

              <div className="supplier-form-group">

                <label>
                  Supplier name
                </label>

                <input
                  type="text"
                  name="name"
                  value={newSupplier.name}
                  onChange={handleSupplierChange}
                />

              </div>


              {/* Category */}

              <div className="supplier-form-group">

                <label>
                  Category
                </label>

                <input
                  type="text"
                  name="category"
                  value={newSupplier.category}
                  onChange={handleSupplierChange}
                />

              </div>


              {/* Email */}

              <div className="supplier-form-group">

                <label>
                  Contact email
                </label>

                <input
                  type="email"
                  name="email"
                  value={newSupplier.email}
                  onChange={handleSupplierChange}
                />

              </div>


              {/* Phone */}

              <div className="supplier-form-group">

                <label>
                  Contact phone
                </label>

                <input
                  type="text"
                  name="phone"
                  value={newSupplier.phone}
                  onChange={handleSupplierChange}
                />

              </div>


              {/* Payment terms */}

              <div className="supplier-form-group">

                <label>
                  Payment terms
                </label>

                <select
                  name="terms"
                  value={newSupplier.terms}
                  onChange={handleSupplierChange}
                >

                  <option value="">
                    Select terms
                  </option>

                  <option value="Net 15">
                    Net 15
                  </option>

                  <option value="Net 30">
                    Net 30
                  </option>

                  <option value="Net 45">
                    Net 45
                  </option>

                  <option value="Net 60">
                    Net 60
                  </option>

                </select>

              </div>


              {/* Lead time */}

              <div className="supplier-form-group">

                <label>
                  Lead time (days)
                </label>

                <input
                  type="number"
                  name="leadTime"
                  min="1"
                  value={newSupplier.leadTime}
                  onChange={handleSupplierChange}
                />

              </div>


              {/* Rating */}

              <div className="supplier-form-group">

                <label>
                  Rating (1–5)
                </label>

                <input
                  type="number"
                  name="rating"
                  min="1"
                  max="5"
                  step="0.1"
                  value={newSupplier.rating}
                  onChange={handleSupplierChange}
                />

              </div>


              {/* Reference price */}

              <div className="supplier-form-group">

                <label>
                  Reference price (₱)
                </label>

                <input
                  type="number"
                  name="referencePrice"
                  min="0"
                  value={newSupplier.referencePrice}
                  onChange={handleSupplierChange}
                />

              </div>

            </div>


            {/* Form buttons */}

            <div className="add-supplier-actions">

              <button
                className="cancel-supplier-btn"
                onClick={handleCancelSupplier}
              >
                Cancel
              </button>

              <button
                className="save-supplier-btn"
                onClick={handleSaveSupplier}
              >
                {editingSupplierId ? "Save changes" : "Save supplier"}
              </button>

            </div>

          </section>

        )}


        {/* =========================
            FILTERS
        ========================= */}

        <section className="supplier-filter-panel">

          <input
            type="text"
            placeholder="Search items or categories"
            className="supplier-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select className="supplier-filter">

            <option>
              Any rating
            </option>

            <option>
              5 stars
            </option>

            <option>
              4 stars & above
            </option>

            <option>
              3 stars & above
            </option>

          </select>

          <select className="supplier-filter">

            <option>
              Any lead time
            </option>

            <option>
              1-3 days
            </option>

            <option>
              4-7 days
            </option>

            <option>
              8+ days
            </option>

          </select>

        </section>


        {/* =========================
            SUPPLIER CARDS
        ========================= */}

        <section className="supplier-cards">

          {filteredSuppliers.map((supplier) => (

            <article
              className="supplier-card"
              key={supplier.id}
            >

              <div className="supplier-card-top">

                <div>

                  <span className="supplier-category">
                    {supplier.category}
                  </span>

                  <h2>
                    {supplier.name}
                  </h2>

                </div>

                <span className="rating-badge">
                  ★{supplier.rating}
                </span>

              </div>


              <div className="supplier-details">

                <div>
                  <span>
                    Lead time
                  </span>

                  <strong>
                    {supplier.lead_time}
                  </strong>
                </div>


                <div>
                  <span>
                    Reference price
                  </span>

                  <strong>
                    ₱{Number(supplier.reference_price).toLocaleString()}
                  </strong>
                </div>


                <div>
                  <span>
                    Terms
                  </span>

                  <strong>
                    {supplier.terms}
                  </strong>
                </div>


                <div>
                  <span>
                    Phone
                  </span>

                  <strong>
                    {supplier.phone}
                  </strong>
                </div>

              </div>


              <p className="supplier-email">
                {supplier.email}
              </p>


              <div className="supplier-card-actions">


                {/* SELECT */}

                <button
                  className={`select-btn ${
                    selectedSupplier === supplier.id
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedSupplier(supplier.id)
                  }
                >
                  {selectedSupplier === supplier.id
                    ? "Selected"
                    : "Select"}
                </button>


                {/* EDIT */}

                <button
                  className="edit-supplier-btn"
                  onClick={() => handleEditSupplier(supplier)}
                >
                  Edit
                </button>


                {/* ARCHIVE */}

                <button
                  className="archive-btn"
                  onClick={() =>
                    setArchiveSupplier(supplier.id)
                  }
                >
                  Archive
                </button>


              </div>

            </article>

          ))}

        </section>


        {/* =========================
            ARCHIVE CONFIRMATION
        ========================= */}

        {archiveSupplier !== null && (

          <section className="archive-confirmation">

            <div className="archive-actions">

              <button
                className="confirm-archive-btn"
                onClick={handleConfirmArchive}
              >
                Confirm Archive
              </button>

              <button
                className="cancel-archive-btn"
                onClick={() =>
                  setArchiveSupplier(null)
                }
              >
                Cancel
              </button>

            </div>

          </section>

        )}

      </main>

    </div>
  );
}

export default Suppliers;
