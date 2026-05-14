import { useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import Navbar from "../components/Navbar";
import "./CreateModeratorPage.css";

function CreateModeratorPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);

  const createModerator = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      await api.post("/Auth/create-moderator", {
        fullName,
        email,
        password,
        department,
      });

      toast.success("Moderatör başarıyla oluşturuldu 🎉");

      setFullName("");
      setEmail("");
      setPassword("");
      setDepartment("");
    } catch (error) {
      console.error(error);

      const message =
        error.response?.data || "Moderatör oluşturulamadı. Lütfen tekrar deneyin.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="moderator-wrapper">
        <div className="moderator-header">
          <h1>Moderatör Ekle</h1>
          <p>Admin olarak sisteme yeni moderatör hesabı oluşturabilirsin.</p>
        </div>

        <div className="moderator-card">
          <h2>Yeni Moderatör Bilgileri</h2>

          <form onSubmit={createModerator} className="moderator-form">
            <div className="form-group">
              <label>Ad Soyad</label>
              <input
                type="text"
                placeholder="Örn: Ahmet Yılmaz"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="moderator@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label>Şifre</label>
              <input
                type="password"
                placeholder="Şifre giriniz"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label>Departman</label>
              <input
                type="text"
                placeholder="Örn: Teknik Destek"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Oluşturuluyor..." : "Moderatör Oluştur"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default CreateModeratorPage;