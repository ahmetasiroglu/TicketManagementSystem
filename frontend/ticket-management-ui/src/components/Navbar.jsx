import { Link, useNavigate, useLocation } from "react-router-dom";
import favicon from "../assets/favicon.png";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || user?.Role;
  const name = user?.fullName || user?.FullName || "Kullanıcı";

  const isActive = (path) => location.pathname === path;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="nav-brand" onClick={() => navigate("/dashboard")}>
        <img src={favicon} alt="TicketFlow" className="brand-icon" />

        <div className="brand-text">
          <strong>
            Ticket<span>Flow</span>
          </strong>
          <small>Şikayet Yönetim Sistemi</small>
        </div>
      </div>

      <nav className="nav-menu">
        <Link className={isActive("/dashboard") ? "active" : ""} to="/dashboard">
          Dashboard
        </Link>

        {(role === "Admin" || role === "Moderator") && (
          <Link className={isActive("/tickets") ? "active" : ""} to="/tickets">
            Tickets
          </Link>
        )}

        {role === "User" && (
          <Link className={isActive("/my-tickets") ? "active" : ""} to="/my-tickets">
            Şikayetlerim
          </Link>
        )}

        {role === "Admin" && (
          <>
            <Link className={isActive("/reports") ? "active" : ""} to="/reports">
              Raporlar
            </Link>
            <Link className={isActive("/create-moderator") ? "active" : ""} to="/create-moderator">
              Moderatör Ekle
            </Link>
          </>
        )}
      </nav>

      <div className="nav-actions">
        <div className="user-pill">
          <div className="avatar">{name.charAt(0).toUpperCase()}</div>
          <div className="user-text">
            <strong>{name}</strong>
            <span>{role}</span>
          </div>
        </div>

        <button className="logout-btn" onClick={logout}>Çıkış</button>
      </div>
    </header>
  );
}

export default Navbar;