import { useState } from "react";

import "./header.css";

import {
  FiBell,
  FiSearch,
  FiChevronDown,
} from "react-icons/fi";

function Header({
  title,
  subtitle,
  search,
  setSearch,
}) {
  const [adminOpen, setAdminOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("Admin");

  const roles = [
    "Admin",
    "Procurement",
    "Finance",
    "Warehouse",
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setAdminOpen(false);
  };

  return (
    <header className="header">

      <div className="header-left">
        {title && <h1>{title}</h1>}

        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className="header-right">


        <div className="admin-dropdown">

          <button
            className="admin-btn"
            onClick={() => setAdminOpen(!adminOpen)}
          >
            <span>{selectedRole}</span>
            <FiChevronDown
              className={adminOpen ? "chevron-up" : ""}
            />
          </button>

          {adminOpen && (
            <div className="admin-menu">

              {roles.map((role) => (
                <button
                  key={role}
                  className={
                    selectedRole === role
                      ? "admin-option selected"
                      : "admin-option"
                  }
                  onClick={() => handleRoleSelect(role)}
                >
                  {role}
                </button>
              ))}

            </div>
          )}

        </div>


        <div className="search-container">

          <FiSearch className="search-icon" />

          <input
            type="text"
            placeholder="Search Records"
            className="search-box"
            value={search || ""}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>


        <button className="bell-btn">

          <FiBell />

          <span className="notification-dot"></span>

        </button>

      </div>

    </header>
  );
}

export default Header;