import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import Navbar from "../components/Navbar";
import "./MyTicketsPage.css";

function MyTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [openTicketId, setOpenTicketId] = useState(null);
  const [notes, setNotes] = useState({});
  const [loadingRatingId, setLoadingRatingId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.userId || user?.UserId;

  useEffect(() => {
    fetchMyTickets();
  }, []);

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

  const fetchMyTickets = async () => {
    try {
      const response = await api.get("/Ticket");

      const filtered = response.data.filter(
        (ticket) => ticket.createdByUserId === userId
      );

      setTickets(filtered);
    } catch (error) {
      console.error(error);
      toast.error("Şikayetler alınamadı");
    }
  };

  const rateTicket = async (ticketId, approved) => {
    if (loadingRatingId) return;

    try {
      setLoadingRatingId(ticketId);

      const noteValue = notes[ticketId] || "";

      await api.put(`/Ticket/${ticketId}/rate`, {
        isResolvedApproved: approved,
        rating: approved ? 5 : 1,
        feedbackNote: noteValue,
      });

      toast.success("Değerlendirme kaydedildi 🎉");
      fetchMyTickets();
    } catch (error) {
      console.error(error);
      toast.error("Değerlendirme kaydedilemedi");
    } finally {
      setLoadingRatingId(null);
    }
  };

  const getStepIndex = (status) => {
    const normalized = normalizeStatus(status);

    switch (normalized) {
      case "Open":
        return 1;
      case "Assigned":
        return 2;
      case "InProgress":
        return 3;
      case "Closed":
        return 4;
      default:
        return 1;
    }
  };

  const toggleDetail = (ticketId) => {
    setOpenTicketId(openTicketId === ticketId ? null : ticketId);
  };

  const isCompleted = (status) => {
    return normalizeStatus(status) === "Closed";
  };

  const getShortStatusText = (status) => {
    return isCompleted(status) ? "Bitti" : "Devam Ediyor";
  };

  return (
    <>
      <Navbar />

      <div className="mytickets-wrapper">
        <div className="mytickets-header">
          <div>
            <h1>Şikayetlerim</h1>
            <p className="mytickets-subtitle">
              Oluşturduğun ticketları ve süreç durumlarını buradan takip
              edebilirsin.
            </p>
          </div>

          <div className="ticket-summary-box">
            <span>Toplam Ticket</span>
            <strong>{tickets.length}</strong>
          </div>
        </div>

        {tickets.length === 0 ? (
          <div className="empty-card">
            <div className="empty-icon">📭</div>
            <h3>Henüz ticket bulunmuyor</h3>
            <p>Oluşturduğun şikayetler burada listelenecek.</p>
          </div>
        ) : (
          <div className="ticket-card-list">
            {tickets.map((ticket) => (
              <div className="ticket-main-card" key={ticket.ticketId}>
                <div className="ticket-top">
                  <div className="ticket-info">
                    <div className="ticket-title-row">
                      <h2>{ticket.title}</h2>
                      <span className="ticket-id">#{ticket.ticketId}</span>
                    </div>

                    <p className="ticket-description">{ticket.description}</p>

                    <div className="ticket-badges">
                      <span
                        className={`ticket-badge ${
                          isCompleted(ticket.status)
                            ? "done-badge"
                            : "progress-badge"
                        }`}
                      >
                        {getShortStatusText(ticket.status)}
                      </span>

                      <span className="ticket-badge status-detail-badge">
                        Durum: {displayStatus(ticket.status)}
                      </span>

                      <span className="ticket-badge priority-badge">
                        Öncelik: {ticket.priority?.priorityName || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="ticket-actions">
                  <button
                    className="detail-btn"
                    onClick={() => toggleDetail(ticket.ticketId)}
                  >
                    {openTicketId === ticket.ticketId
                      ? "Detayı Kapat"
                      : "Detay Gör"}
                  </button>
                </div>

                {openTicketId === ticket.ticketId && (
                  <div className="ticket-detail-box">
                    <div className="detail-top-row">
                      <h3>Şikayet Süreci</h3>
                      <span
                        className={`mini-state ${
                          isCompleted(ticket.status)
                            ? "mini-state-done"
                            : "mini-state-progress"
                        }`}
                      >
                        {getShortStatusText(ticket.status)}
                      </span>
                    </div>

                    <div className="ticket-timeline">
                      <div
                        className={`timeline-step ${
                          getStepIndex(ticket.status) >= 1 ? "active" : ""
                        }`}
                      >
                        <div className="timeline-circle">1</div>
                        <div className="timeline-label">Şikayet Alındı</div>
                      </div>

                      <div
                        className={`timeline-line ${
                          getStepIndex(ticket.status) >= 2 ? "active" : ""
                        }`}
                      />

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
                      />

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
                      />

                      <div
                        className={`timeline-step ${
                          getStepIndex(ticket.status) >= 4 ? "active" : ""
                        }`}
                      >
                        <div className="timeline-circle">4</div>
                        <div className="timeline-label">Çözüldü</div>
                      </div>
                    </div>

                    {isCompleted(ticket.status) && ticket.rating == null && (
                      <div className="rating-box">
                        <h4>Çözüm durumunu değerlendir</h4>

                        <div className="rating-note-box">
                          <label>Yorum / Not bırak</label>
                          <textarea
                            placeholder="Sorun çözüldüyse veya çözülmediyse açıklama yazabilirsiniz."
                            value={notes[ticket.ticketId] || ""}
                            onChange={(e) =>
                              setNotes((prev) => ({
                                ...prev,
                                [ticket.ticketId]: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="rating-buttons">
                          <button
                            className="success-btn"
                            disabled={loadingRatingId === ticket.ticketId}
                            onClick={() => rateTicket(ticket.ticketId, true)}
                          >
                            {loadingRatingId === ticket.ticketId
                              ? "Kaydediliyor..."
                              : "Sorunum Çözüldü"}
                          </button>

                          <button
                            className="danger-btn"
                            disabled={loadingRatingId === ticket.ticketId}
                            onClick={() => rateTicket(ticket.ticketId, false)}
                          >
                            {loadingRatingId === ticket.ticketId
                              ? "Kaydediliyor..."
                              : "Sorunum Çözülmedi"}
                          </button>
                        </div>
                      </div>
                    )}

                    {ticket.rating != null && (
                      <div className="rating-result">
                        <p>
                          <strong>Sonuç:</strong>{" "}
                          {ticket.isResolvedApproved
                            ? "Sorunum Çözüldü"
                            : "Sorunum Çözülmedi"}
                        </p>

                        <p>
                          <strong>Sistem Puanı:</strong> {ticket.rating} / 5
                        </p>

                        {ticket.feedbackNote && (
                          <p>
                            <strong>Kullanıcı Yorumu:</strong>{" "}
                            {ticket.feedbackNote}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default MyTicketsPage;