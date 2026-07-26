import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Suppliers from "./pages/Suppliers";
import Orders from "./pages/Orders";
import Deliveries from "./pages/Deliveries";
import Approvals from "./pages/Approvals";
import AuditTrails from "./pages/AuditTrails";
import { requireStaffUser } from "./services/auth.js";

import "./App.css";

function App() {
  // Only staff who came from the Kairos login land here - anyone else
  // (nobody logged in, or an admin who wandered in) gets bounced back
  // to Kairos to sign in properly.
  const user = requireStaffUser();
  if (!user) return null;

  const path = window.location.pathname;

  if (path === "/inventory") {
    return <Inventory />;
  }
  if (path === "/suppliers") {
    return <Suppliers />;
  }
  if (path === "/orders") {
    return <Orders />;
  }
  if (path === "/approvals") {
    return <Approvals />
  }
  if (path === "/deliveries") {
    return <Deliveries />;
  }
  if (path === "/audit-trails") {
    return <AuditTrails />;
  }

  return <Dashboard />;
}

export default App;