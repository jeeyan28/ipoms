import { useState, useEffect } from "react";
import {
  FiPackage,
  FiClock,
  FiFileText,
  FiDollarSign,
} from "react-icons/fi";

import AutoReorder from "../components/AutoReorder";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import Order from "../components/Order";
import Reorder from "../components/Reorder";
import { dashboardApi, purchaseOrdersApi, suppliersApi } from "../services/api";

import "./dashboard.css";

function Dashboard() {
  const [search, setSearch] = useState("");
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState(null);

  const reload = () => {
    dashboardApi.get().then(setSummary).catch((err) => setError(err.message));
    purchaseOrdersApi.list().then(setOrders).catch(() => {});
    suppliersApi.list().then(setSuppliers).catch(() => {});
  };

  useEffect(() => {
    reload();
  }, []);

  const stats = [
    {
      title: "Low-stock Items",
      value: summary?.lowStockCount ?? "—",
      description: "Needs restocking",
      warning: true,
      icon: <FiPackage />,
      color: "#f9e9ee",
    },
    {
      title: "Pending Approvals",
      value: summary?.pendingApprovalsCount ?? "—",
      description: "Awaiting decision",
      icon: <FiClock />,
      color: "#fff4d9",
    },
    {
      title: "Open Purchase Orders",
      value: summary?.openOrdersCount ?? "—",
      description: "Across active vendors",
      icon: <FiFileText />,
      color: "#e7f6ef",
    },
    {
      title: "Inbound Order Value",
      value: summary ? `₱${Number(summary.inboundValue).toLocaleString()}` : "—",
      description: "Approximate open commitment",
      icon: <FiDollarSign />,
      color: "#efe7fb",
    },
  ];

  return (
    <div className="dashboard">
      <Sidebar />

      <main className="main-content">
        <Header
           title="Operations Overview"
           subtitle="Monitor procurement activities and inventory status."
           search={search}
           setSearch={setSearch}
            />

        {error && <p style={{ color: "#d03443" }}>{error}</p>}

        <section className="cards">
          {stats.map((card, index) => (
            <StatCard
              key={index}
              title={card.title}
              value={card.value}
              description={card.description}
              warning={card.warning}
              icon={card.icon}
              color={card.color}
            />
          ))}
        </section>

        <section className="widgets">
          <Reorder items={summary?.lowStockItems || []} onRefresh={reload} />
          <Order orders={orders} />
        </section>

        <AutoReorder items={summary?.lowStockItems || []} suppliers={suppliers} onCreated={reload} />
      </main>
    </div>
  );
}

export default Dashboard;
