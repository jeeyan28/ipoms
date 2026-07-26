import { useState, useEffect } from "react";
import { FiClock } from "react-icons/fi";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { auditTrailApi } from "../services/api";

import "./audittrails.css";

function formatDetails(event) {
  const when = event.created_at
    ? new Date(event.created_at).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";
  return `${when} · ${event.actor || "Admin"}`;
}

function AuditTrails() {
  const [search, setSearch] = useState("");
  const [auditEvents, setAuditEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    auditTrailApi
      .list()
      .then((data) => setAuditEvents(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredEvents = auditEvents.filter((event) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      event.action?.toLowerCase().includes(term) ||
      event.reference?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="audittrails-page">

      <Sidebar />

      <main className="audittrails-content">

        <Header
          search={search}
          setSearch={setSearch}
        />

        <section className="audittrails-heading">

          <span className="page-label">
            PROCUREMENT COMMAND CENTRE
          </span>

          <h1>Audit trail</h1>

          <p className="audittrails-subtitle">
            A timestamped history of procurement and inventory actions.
          </p>

        </section>

        {error && <p style={{ color: "#d03443" }}>{error}</p>}
        {loading && <p>Loading audit trail…</p>}

        <section className="audit-panel">

          <div className="audit-timeline">

            {filteredEvents.map((event) => (

              <div className="audit-event" key={event.id}>

                <div className="audit-icon">
                  <FiClock />
                </div>

                <div className="audit-event-content">

                  <div className="audit-action">
                    {event.action}
                  </div>

                  <div className="audit-reference">
                    {event.reference}
                  </div>

                  <div className="audit-details">
                    {formatDetails(event)}
                  </div>

                </div>

              </div>

            ))}

          </div>

        </section>

      </main>

    </div>
  );
}

export default AuditTrails;
