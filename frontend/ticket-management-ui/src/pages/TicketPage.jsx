import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import Navbar from "../components/Navbar";
import "./TicketPage.css";

function TicketPage() {
  const [tickets, setTickets] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingTicketId, setUpdatingTicketId] = useState(null);

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || user?.Role;

  useEffect(() => {
    if (role === "User") {
      navigate("/my-tickets");
      return;
    }

    fetchTickets();
  }, [role, navigate]);

  const normalizeStatus = (status) => {
    if (status === "Sikayet Alindi") return "Open";
    if (status === "Moderator Inceliyor") return "Assigned";
    if (status === "Tamir Asamasinda") return "InProgress";
    if (status === "Cozuldu") return "Closed";

    return status || "Open";
  };

  const displayStatus = (status) => {
    const normalized = normalizeStatus(status);

    switch (normalized) {
      case "Open":
        return "Şikayet Alındı";
      case "Assigned":
        return "İnceleniyor";
      case "InProgress":
        return "Çözüm Aşamasında";
      case "Closed":
        return "Çözüldü";
      default:
        return normalized;
    }
  };

  const fetchTickets = async () => {
    try {
      const response = await api.get("/Ticket");
      setTickets(response.data);

      const statusMap = {};
      response.data.forEach((ticket) => {
        statusMap[ticket.ticketId] = normalizeStatus(ticket.status);
      });

      setSelectedStatuses(statusMap);
    } catch (error) {
      console.error(error);
      toast.error("Şikayetler alınamadı");
    }
  };

  const handleStatusChange = (ticketId, value) => {
    setSelectedStatuses((prev) => ({
      ...prev,
      [ticketId]: value,
    }));
  };

  const updateStatus = async (ticketId) => {
    if (updatingTicketId) return;

    try {
      setUpdatingTicketId(ticketId);

      await api.put(`/Ticket/${ticketId}/status`, {
        status: selectedStatuses[ticketId],
      });

      toast.success("Durum güncellendi 🎉");
      await fetchTickets();
    } catch (error) {
      console.error(error);
      toast.error("Durum güncellenemedi");
    } finally {
      setUpdatingTicketId(null);
    }
  };

  const filterTicketsByDate = (ticketList) => {
    const now = new Date();

    return ticketList.filter((ticket) => {
      const createdDate = new Date(ticket.createdAt);

      if (dateFilter === "today") {
        return createdDate.toDateString() === now.toDateString();
      }

      if (dateFilter === "week") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        return createdDate >= sevenDaysAgo;
      }

      if (dateFilter === "month") {
        return (
          createdDate.getMonth() === now.getMonth() &&
          createdDate.getFullYear() === now.getFullYear()
        );
      }

      if (dateFilter === "year") {
        return createdDate.getFullYear() === now.getFullYear();
      }

      return true;
    });
  };

  const filteredTickets = filterTicketsByDate(tickets).filter((ticket) => {
    if (statusFilter === "all") return true;
    return normalizeStatus(ticket.status) === statusFilter;
  });

  return (
    <>
      <Navbar />

      <div className="tickets-wrapper">
        <h1>Şikayet Yönetimi</h1>
        <p className="tickets-subtitle">
          Sistemdeki tüm şikayetleri görüntüleyebilir, süreç durumlarını
          güncelleyebilir ve kullanıcı geri bildirimlerini inceleyebilirsin.
        </p>

        <div className="filter-box">
          <label>Tarih filtresi:</label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">Tümü</option>
            <option value="today">Bugün</option>
            <option value="week">Bu Hafta</option>
            <option value="month">Bu Ay</option>
            <option value="year">Bu Yıl</option>
          </select>
        </div>

        <div className="ticket-filter-card">
          <div className="ticket-filter-group">
            <label>Durum filtresi:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Hepsi</option>
              <option value="Open">Hiç Bakılmayanlar</option>
              <option value="Assigned">İncelenenler</option>
              <option value="InProgress">Çözüm Aşamasında Olanlar</option>
              <option value="Closed">Çözülenler</option>
            </select>
          </div>
        </div>

        <div className="tickets-list">
          {filteredTickets.length === 0 ? (
            <div className="ticket-admin-card">
              <h2>Ticket bulunamadı</h2>
              <p>Seçilen filtreye uygun ticket yok.</p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div className="ticket-admin-card" key={ticket.ticketId}>
                <div className="ticket-admin-top">
                  <div className="ticket-admin-info">
                    <h2>{ticket.title}</h2>
                    <p>{ticket.description}</p>

                    <div className="ticket-admin-meta">
                      <span className="meta-badge">
                        Mevcut Durum: {displayStatus(ticket.status)}
                      </span>

                      <span className="meta-badge light">
                        Öncelik: {ticket.priority?.priorityName || "-"}
                      </span>

                      <span className="meta-badge light">
                        Oluşturan:{" "}
                        {ticket.createdByUser?.fullName ||
                          ticket.createdByUser?.FullName ||
                          ticket.createdByUserId}
                      </span>

                      <span className="meta-badge light">
                        Tarih:{" "}
                        {ticket.createdAt
                          ? new Date(ticket.createdAt).toLocaleDateString(
                              "tr-TR"
                            )
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="ticket-admin-actions">
                  <select
                    value={
                      selectedStatuses[ticket.ticketId] ||
                      normalizeStatus(ticket.status)
                    }
                    onChange={(e) =>
                      handleStatusChange(ticket.ticketId, e.target.value)
                    }
                    disabled={updatingTicketId === ticket.ticketId}
                  >
                    <option value="Open">Şikayet Alındı</option>
                    <option value="Assigned">İnceleniyor</option>
                    <option value="InProgress">Çözüm Aşamasında</option>
                    <option value="Closed">Çözüldü</option>
                  </select>

                  <button
                    onClick={() => updateStatus(ticket.ticketId)}
                    disabled={updatingTicketId === ticket.ticketId}
                  >
                    {updatingTicketId === ticket.ticketId
                      ? "Güncelleniyor..."
                      : "Durumu Güncelle"}
                  </button>
                </div>

                {(ticket.rating != null ||
                  ticket.feedbackNote ||
                  ticket.isResolvedApproved != null) && (
                  <div className="feedback-box">
                    <h3>Kullanıcı Geri Bildirimi</h3>

                    <div className="feedback-grid">
                      <div className="feedback-item">
                        <span className="feedback-label">Puan</span>
                        <span className="feedback-value">
                          {ticket.rating != null ? `${ticket.rating} / 5` : "-"}
                        </span>
                      </div>

                      <div className="feedback-item">
                        <span className="feedback-label">Memnuniyet</span>
                        <span className="feedback-value">
                          {ticket.isResolvedApproved == null
                            ? "-"
                            : ticket.isResolvedApproved
                            ? "Sorunum Çözüldü"
                            : "Sorunum Çözülmedi"}
                        </span>
                      </div>
                    </div>

                    <div className="feedback-note">
                      <strong>Kullanıcı Yorumu:</strong>{" "}
                      {ticket.feedbackNote && ticket.feedbackNote.trim() !== ""
                        ? ticket.feedbackNote
                        : "Kullanıcı yorum bırakmamış."}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default TicketPage;