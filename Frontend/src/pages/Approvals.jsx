import { useState, useEffect } from "react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { approvalsApi } from "../services/api";

import "./approvals.css";

function Approvals() {
  const [search, setSearch] = useState("");
  const [comments, setComments] = useState({});
  const [department, setDepartment] = useState("Administration");
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [decidingId, setDecidingId] = useState(null);

  const loadApprovals = () => {
    setLoading(true);
    setError(null);
    approvalsApi
      .list()
      .then((data) => setApprovals(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const handleCommentChange = (id, value) => {
    setComments((current) => ({
      ...current,
      [id]: value,
    }));
  };

  const decide = async (purchaseOrder, decision) => {
    setDecidingId(purchaseOrder.id);
    try {
      await approvalsApi.decide({
        purchaseOrderId: purchaseOrder.id,
        decision,
        department,
        comment: comments[purchaseOrder.id] || "",
      });
      loadApprovals();
    } catch (err) {
      alert(err.message);
    } finally {
      setDecidingId(null);
    }
  };

  const filteredApprovals = approvals.filter((approval) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      approval.item_name?.toLowerCase().includes(term) ||
      approval.po_number?.toLowerCase().includes(term) ||
      approval.supplier_name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="approvals-page">

      <Sidebar />

      <main className="approvals-content">

        <Header
          search={search}
          setSearch={setSearch}
        />

        <section className="approvals-heading">

          <div>
            <span className="page-label">
              PROCUREMENT COMMAND CENTRE
            </span>

            <h1>Approval centre</h1>

            <p className="approvals-subtitle">
              Review value, supplier, quantity, and decision context.
            </p>
          </div>

        </section>

        <div className="approval-notice">
          Admin can approve or reject orders.
        </div>

        {error && <p style={{ color: "#d03443" }}>{error}</p>}
        {loading && <p>Loading approvals…</p>}
        {!loading && filteredApprovals.length === 0 && (
          <p>No purchase orders are currently awaiting approval.</p>
        )}

        <section className="approval-cards">

          {filteredApprovals.map((approval) => (

            <article className="approval-card" key={approval.id}>

              <div className="approval-card-header">

                <span className="approval-po">
                  {approval.po_number} · {approval.approval_status}
                </span>

                <h2>{approval.item_name}</h2>

                <p>
                  Supplier: {approval.supplier_name}
                  {" · "}
                  Quantity: {approval.quantity}
                  {" · "}
                  Total: ₱{Number(approval.total).toLocaleString()}
                </p>

              </div>

              <div className="decision-section">

                <label htmlFor={`comment-${approval.id}`}>
                  Decision comment
                </label>

                <textarea
                  id={`comment-${approval.id}`}
                  placeholder="Add context for audit trail"
                  value={comments[approval.id] || ""}
                  onChange={(e) =>
                    handleCommentChange(approval.id, e.target.value)
                  }
                />

              </div>

              <div className="approval-buttons">

                <button
                  className="approve-btn"
                  onClick={() => decide(approval, "Approved")}
                  disabled={decidingId === approval.id}
                >
                  Approve
                </button>

                <button
                  className="reject-btn"
                  onClick={() => decide(approval, "Rejected")}
                  disabled={decidingId === approval.id}
                >
                  Reject
                </button>

              </div>

            </article>

          ))}

        </section>

      </main>

    </div>
  );
}

export default Approvals;
