import "./sidebar.css";
import {
  FiGrid,
  FiArchive,
  FiShoppingCart,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiPackage,
  FiFileText,
  FiFile,
  FiSend,
} from "react-icons/fi";
import { getCurrentUser, logout } from "../services/auth.js";

const menuItems = [
  {
    icon: <FiGrid />,
    label: "Dashboard",
    path: "/",
  },
  {
    icon: <FiArchive />,
    label: "Inventory",
    path: "/inventory",
  },
  {
    icon: <FiUsers />,
    label: "Suppliers",
    path: "/suppliers",
  },
  {
    icon: <FiShoppingCart />,
    label: "Orders",
    path: "/orders",
  },
  {
    icon: <FiFileText />,
    label: "Approvals",
    path: "/approvals",
  },
  {
    icon: <FiSend/>,
    label: "Deliveries",
    path: "/deliveries",
  },
  {
    icon:<FiFile/>,
    label:"Audit Trails",
    path:"/audit-trails",
  },
];

function Sidebar() {
  const currentPath = window.location.pathname;
  const user = getCurrentUser();

  return (
    <aside className="sidebar">
      <div className="logo">

        <div className="logo-circle">
          IP
        </div>

        <div className="logo-text">
          <h2>IPOMS</h2>
          <span>Procurement System</span>
        </div>

      </div>

      <nav>
        <ul>

          {menuItems.map((item) => (

            <li
              key={item.label}
              className={currentPath === item.path ? "active" : ""}
              onClick={() => {
                window.location.href = item.path;
              }}
            >

              {item.icon}

              <span>{item.label}</span>

            </li>

          ))}

        </ul>
      </nav>

      <div className="sidebar-footer">

        <button className="logout-btn" onClick={logout}>
          <FiLogOut />
          Logout
        </button>

        {user && (
          <div className="signed-in">
            <span>Signed in as:</span>
            <strong>{user.name || user.email}</strong>
            <small>Role: {user.role}</small>
          </div>
        )}

      </div>

    </aside>
  );
}

export default Sidebar;