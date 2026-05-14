import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import logo from "../assets/logo.png";
import "./LoginPage.css";

function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/Auth/login", formData);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Giriş başarılı");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Giriş başarısız. Email veya şifre hatalı.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-overlay"></div>

      <div className="login-card">
        <div className="login-left">
          <div className="login-logo-box">
            <img src={logo} alt="TicketFlow" className="login-logo" />
          </div>

          <h1>Şikayet Yönetim Sistemi</h1>
          <p>
            Şikayetlerinizi, taleplerinizi ve destek süreçlerinizi tek bir
            yerden kolayca yönetin.
          </p>

          <div className="login-features">
            <div className="feature-box">
              <span>⚡</span>
              <p>Hızlı ticket takibi</p>
            </div>

            <div className="feature-box">
              <span>🔒</span>
              <p>Güvenli kullanıcı girişi</p>
            </div>

            <div className="feature-box">
              <span>📊</span>
              <p>Rol bazlı dashboard görünümü</p>
            </div>
          </div>
        </div>

        <div className="login-right">
          <h2>Giriş Yap</h2>
          <p className="login-subtitle">
            Hesabınıza erişmek için bilgilerinizi girin
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="ornek@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Şifre</label>
              <input
                type="password"
                name="password"
                placeholder="Şifrenizi girin"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="login-btn">
              Giriş Yap
            </button>
          </form>

          <div className="demo-users">
            <p>Demo hesaplar:</p>
            <small>Admin: admin@test.com / 123456</small>
            <small>Moderator: moderator@test.com / 123456</small>
          </div>

          <p className="register-text">
            Hesabın yok mu?{" "}
            <span onClick={() => navigate("/register")}>Kayıt Ol</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;