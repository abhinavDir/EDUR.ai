import { useState } from "react";
import "./nav.css";
import { Link, useNavigate } from "react-router-dom";

import {
  FaBars,
  FaTimes,
  FaHome,
  FaSearch,
  FaMapMarkerAlt,
  FaUser,
  FaUserCircle,
  FaBell    // ✅ Added Bell Icon
} from "react-icons/fa";

export default function Nav({ isLoggedIn, setIsLoggedIn }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    if (setIsLoggedIn) setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <>
      {/* -------- TOP NAV -------- */}
      <nav className="top-nav">
        <div className="logo">EdURAI</div>

        {/* -------- DESKTOP MENU -------- */}
        <ul className="menu desktop-menu">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/features">Features</Link></li>

          {isLoggedIn && (
            <li className="desktop-dashboard">
              <Link to="/dashboard">
                <FaUserCircle className="dash-icon" />
                Dashboard
              </Link>
            </li>
          )}

          {!isLoggedIn && (
            <li>
              <Link to="/login" className="login-btn">Login</Link>
            </li>
          )}

          {!isLoggedIn && (
            <li>
              <Link to="/signup" className="signup-btn">Signup</Link>
            </li>
          )}

          {isLoggedIn && (
            <li>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </li>
          )}
        </ul>

        {/* Mobile Menu Toggle */}
        <div className="menu-btn" onClick={() => setOpen(!open)}>
          {open ? <FaTimes /> : <FaBars />}
        </div>
      </nav>

      {/* -------- MOBILE DROPDOWN -------- */}
      {open && (
        <ul className="mobile-dropdown">
          <li><Link to="/" onClick={() => setOpen(false)}>Home</Link></li>
          <li><Link to="/about" onClick={() => setOpen(false)}>About</Link></li>
          <li><Link to="/features" onClick={() => setOpen(false)}>Features</Link></li>

          {isLoggedIn && (
            <li>
              <Link to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
            </li>
          )}

          {!isLoggedIn && (
            <li>
              <Link to="/login" onClick={() => setOpen(false)}>Login</Link>
            </li>
          )}

          {!isLoggedIn && (
            <li>
              <Link to="/signup" onClick={() => setOpen(false)}>Signup</Link>
            </li>
          )}

          {isLoggedIn && (
            <li>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </li>
          )}
        </ul>
      )}

      {/* -------- BOTTOM NAV (MOBILE) -------- */}
      <div className="bottom-nav">
        <Link to="/" className="bottom-item">
          <FaHome />
          <span>Home</span>
        </Link>

        <Link to="/features" className="bottom-item">
          <FaSearch />
          <span>Search</span>
        </Link>

        <Link to="/location" className="bottom-item">
          <FaMapMarkerAlt />
          <span>Location</span>
        </Link>

        <Link to="/dashboard" className="bottom-item">
          <FaUser />
          <span>Dashboard</span>
        </Link>

        {/* ✅ NEW REMINDER TAB WITH BELL ICON */}
        <Link to="/reminder" className="bottom-item">
          <FaBell />
          <span>Reminder</span>
        </Link>
      </div>
    </>
  );
}
