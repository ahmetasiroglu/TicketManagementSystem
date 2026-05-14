import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import logo from "../assets/logo.png";
import "./LoginPage.css";

function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      await api.post("/Auth/register", {
        fullName,
        email,
        password,
        department,
      });

      toast.success("Kayıt başarılı 🎉");

      setFullName("");
      setEmail("");
      setPassword("");
      setDepartment("");

      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (error) {
      console.error(error);

      const message =
        error.response?.data || "Kayıt başarısız. Lütfen tekrar deneyin.";

      toast.error(message);
    } finally {
      setLoading(false);
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
            Şikayetlerinizi oluşturabilir, süreçlerini takip edebilir ve çözüm
            durumlarını görüntüleyebilirsiniz.
          </p>

          <div className="login-features">
            <div className="feature-box">
              <span>📌</span>
              <p>Şikayet oluşturma ve takip etme</p>
            </div>

            <div className="feature-box">
              <span>📊</span>
              <p>Durum ve süreç takibi</p>
            </div>

            <div className="feature-box">
              <span>🔐</span>
              <p>Güvenli giriş ve kullanıcı yönetimi</p>
            </div>
          </div>
        </div>

        <div className="login-right">
          <h2>Kayıt Ol</h2>
          <p className="login-subtitle">
            Sisteme kayıt olarak şikayet oluşturmaya başlayabilirsiniz.
          </p>

          <form className="login-form" onSubmit={handleRegister}>
            <div className="input-group">
              <label>Ad Soyad</label>
              <input
                type="text"
                placeholder="Ad Soyad"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Şifre</label>
              <input
                type="password"
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Departman</label>
              <input
                type="text"
                placeholder="Departman"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              />
            </div>

            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "Kaydediliyor..." : "Kayıt Ol"}
            </button>
          </form>

          <p className="register-text">
            Zaten hesabın var mı?{" "}
            <span onClick={() => navigate("/")}>Giriş Yap</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;