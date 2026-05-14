import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import Navbar from "../components/Navbar";
import "./DashboardPage.css";

function DashboardPage() {
  const [allTickets, setAllTickets] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || user?.Role;
  const userId = user?.userId || user?.UserId;
  const fullName = user?.fullName || user?.FullName;

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await api.get("/Ticket");
      setAllTickets(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Ticket verileri alınamadı");
    }
  };

  const createTicket = async (e) => {
    e.preventDefault();

    if (creating) return;

    try {
      setCreating(true);

      await api.post("/Ticket", {
        title,
        description,
        categoryId: 1,
        priorityId: 1,
        createdByUserId: userId,
      });

      toast.success("Şikayet başarıyla oluşturuldu 🎉");

      setTitle("");
      setDescription("");
      fetchTickets();
    } catch (error) {
      console.error(error);
      toast.error("Şikayet oluşturulamadı");
    } finally {
      setCreating(false);
    }
  };

  const getStepIndex = (status) => {
    switch (status) {
      case "Sikayet Alindi":
      case "Open":
        return 1;
      case "Moderator Inceliyor":
        return 2;
      case "Tamir Asamasinda":
      case "InProgress":
      case "Assigned":
        return 3;
      case "Cozuldu":
      case "Closed":
        return 4;
      default:
        return 1;
    }
  };

  const myTickets = allTickets.filter(
    (ticket) => ticket.createdByUserId === userId
  );

  const totalMyTickets = myTickets.length;

  const activeMyTickets = myTickets.filter(
    (ticket) => ticket.status !== "Cozuldu" && ticket.status !== "Closed"
  );

  const resolvedMyTickets = myTickets.filter(
    (ticket) => ticket.status === "Cozuldu" || ticket.status === "Closed"
  );

  const inProgressMyTickets = myTickets.filter(
    (ticket) =>
      ticket.status === "Moderator Inceliyor" ||
      ticket.status === "Tamir Asamasinda" ||
      ticket.status === "InProgress" ||
      ticket.status === "Assigned"
  );

  const totalTickets = allTickets.length;

  const openTickets = allTickets.filter(
    (ticket) => ticket.status === "Sikayet Alindi" || ticket.status === "Open"
  ).length;

  const allInProgressTickets = allTickets.filter(
    (ticket) =>
      ticket.status === "Moderator Inceliyor" ||
      ticket.status === "Tamir Asamasinda" ||
      ticket.status === "InProgress" ||
      ticket.status === "Assigned"
  ).length;

  const closedTickets = allTickets.filter(
    (ticket) => ticket.status === "Cozuldu" || ticket.status === "Closed"
  ).length;

  return (
    <>
      <Navbar />

      <div className="dashboard-wrapper">
        <div className="dashboard-hero">
          <div>
            <h1>Hoş geldin, {fullName} 👋</h1>
            <p>Sistemdeki ticket süreçlerini buradan takip edebilirsin.</p>
          </div>

          <div className="role-badge">Rol: {role}</div>
        </div>

        {role === "User" && (
          <>
            <div className="dashboard-cards">
              <div className="stat-card">
                <div className="stat-icon">📨</div>
                <div>
                  <h3>{totalMyTickets}</h3>
                  <p>Toplam Şikayetim</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon yellow">📂</div>
                <div>
                  <h3>{activeMyTickets.length}</h3>
                  <p>Aktif Şikayet</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon purple">⏳</div>
                <div>
                  <h3>{inProgressMyTickets.length}</h3>
                  <p>Devam Eden</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon green">✅</div>
                <div>
                  <h3>{resolvedMyTickets.length}</h3>
                  <p>Sonuçlanan</p>
                </div>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="info-card">
                <h2>Yeni Şikayet Oluştur</h2>
                <p>Sistemde yeni bir şikayet kaydı açabilirsin.</p>

                <form onSubmit={createTicket} className="ticket-form">
                  <input
                    type="text"
                    placeholder="Şikayet başlığı"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={creating}
                    required
                  />

                  <textarea
                    placeholder="Şikayet açıklaması"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={creating}
                    required
                  ></textarea>

                  <button type="submit" disabled={creating}>
                    {creating ? "Gönderiliyor..." : "Şikayet Et"}
                  </button>
                </form>
              </div>

              <div className="info-card highlight-green">
                <h2>Kullanıcı Paneli</h2>
                <p>Kendi ticketlarını görüntüleyebilirsin.</p>
                <p>Başvuru durumlarını takip edebilirsin.</p>
                <p>Destek sürecindeki gelişmeleri izleyebilirsin.</p>
              </div>
            </div>

            <div className="info-card" style={{ marginTop: "24px" }}>
              <h2>Aktif Şikayetlerin</h2>

              {activeMyTickets.length === 0 ? (
                <p>Şu anda aktif şikayetin bulunmuyor.</p>
              ) : (
                <div className="ticket-status-list">
                  {activeMyTickets.map((ticket) => (
                    <div className="ticket-status-item" key={ticket.ticketId}>
                      <div>
                        <h3>{ticket.title}</h3>
                        <p>{ticket.description}</p>
                      </div>

                      <div className="ticket-timeline-wrapper">
                        <div className="ticket-timeline">
                          <div
                            className={`timeline-step ${
                              getStepIndex(ticket.status) >= 1 ? "active" : ""
                            }`}
                          >
                            <div className="timeline-circle">1</div>
                            <div className="timeline-label">
                              Şikayet Alındı
                            </div>
                          </div>

                          <div
                            className={`timeline-line ${
                              getStepIndex(ticket.status) >= 2 ? "active" : ""
                            }`}
                          ></div>

                          <div
                            className={`timeline-step ${
                              getStepIndex(ticket.status) >= 2 ? "active" : ""
                            }`}
                          >
                            <div className="timeline-circle">2</div>
                            <div className="timeline-label">İnceleniyor</div>
                          </div>

                          <div
                            className={`timeline-line ${
                              getStepIndex(ticket.status) >= 3 ? "active" : ""
                            }`}
                          ></div>

                          <div
                            className={`timeline-step ${
                              getStepIndex(ticket.status) >= 3 ? "active" : ""
                            }`}
                          >
                            <div className="timeline-circle">3</div>
                            <div className="timeline-label">Çözüm Aşaması</div>
                          </div>

                          <div
                            className={`timeline-line ${
                              getStepIndex(ticket.status) >= 4 ? "active" : ""
                            }`}
                          ></div>

                          <div
                            className={`timeline-step ${
                              getStepIndex(ticket.status) >= 4 ? "active" : ""
                            }`}
                          >
                            <div className="timeline-circle">4</div>
                            <div className="timeline-label">Çözüldü</div>
                          </div>
                        </div>

                        <div className="ticket-meta">
                          <span className="ticket-badge">
                            Durum: {ticket.status}
                          </span>
                          <span className="ticket-badge light">
                            Öncelik: {ticket.priority?.priorityName || "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {(role === "Admin" || role === "Moderator") && (
          <>
            <div className="dashboard-cards">
              <div className="stat-card">
                <div className="stat-icon">📨</div>
                <div>
                  <h3>{totalTickets}</h3>
                  <p>Toplam Ticket</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon yellow">📂</div>
                <div>
                  <h3>{openTickets}</h3>
                  <p>Açık Ticket</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon purple">⏳</div>
                <div>
                  <h3>{allInProgressTickets}</h3>
                  <p>Devam Eden</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon green">✅</div>
                <div>
                  <h3>{closedTickets}</h3>
                  <p>Kapalı Ticket</p>
                </div>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="info-card">
                <h2>Genel Bilgilendirme</h2>
                <p>Ticket süreçlerini hızlı takip edebilirsin.</p>
                <p>Durumları görüntüleyebilirsin.</p>
                <p>Sistemin genel performansını inceleyebilirsin.</p>
              </div>

              <div className="info-card highlight-green">
                <h2>
                  {role === "Admin" ? "Yönetici Paneli" : "Moderatör Paneli"}
                </h2>

                {role === "Admin" && (
                  <>
                    <p>Tüm sistemi görüntüleyebilir.</p>
                    <p>Raporlama ekranlarını inceleyebilir.</p>
                    <p>Şikayet dağılımını görebilir.</p>
                  </>
                )}

                {role === "Moderator" && (
                  <>
                    <p>Şikayetleri yönetebilir.</p>
                    <p>Durum güncelleyebilir.</p>
                    <p>Yorum ve süreç takibi yapabilir.</p>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default DashboardPage;