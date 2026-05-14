import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import Navbar from "../components/Navbar";
import "./ModeratorDetailPage.css";

function ModeratorDetailPage() {
  const { id } = useParams();
  const moderatorId = Number(id);

  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [period, setPeriod] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const ticketRes = await api.get("/Ticket");
      const userRes = await api.get("/Auth/users");

      setTickets(ticketRes.data);
      setUsers(userRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Moderatör detay verileri alınamadı");
    }
  };

  const moderator = users.find(
    (u) => (u.userId || u.UserId) === moderatorId
  );

  const moderatorTickets = tickets.filter(
    (t) => t.assignedToUserId === moderatorId
  );

  const filterByPeriod = (list) => {
    const now = new Date();

    return list.filter((ticket) => {
      const date = new Date(ticket.updatedAt || ticket.closedAt || ticket.createdAt);

      if (period === "today") {
        return date.toDateString() === now.toDateString();
      }

      if (period === "week") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        return date >= sevenDaysAgo;
      }

      if (period === "month") {
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      }

      if (period === "year") {
        return date.getFullYear() === now.getFullYear();
      }

      return true;
    });
  };

  const filteredTickets = useMemo(
    () => filterByPeriod(moderatorTickets),
    [moderatorTickets, period]
  );

  const solved = filteredTickets.filter(
    (t) => t.status === "Cozuldu" || t.status === "Closed"
  );

  const active = filteredTickets.filter(
    (t) => t.status !== "Cozuldu" && t.status !== "Closed"
  );

  const rated = filteredTickets.filter((t) => t.rating != null);

  const approved = rated.filter((t) => t.isResolvedApproved === true);
  const rejected = rated.filter((t) => t.isResolvedApproved === false);

  const solveRate =
    filteredTickets.length > 0
      ? Math.round((solved.length / filteredTickets.length) * 100)
      : 0;

  const satisfactionRate =
    rated.length > 0 ? Math.round((approved.length / rated.length) * 100) : 0;

  const monthList = useMemo(() => {
    if (!moderator?.createdAt && !moderator?.CreatedAt) return [];

    const start = new Date(moderator.createdAt || moderator.CreatedAt);
    const now = new Date();

    const months = [];
    const current = new Date(start.getFullYear(), start.getMonth(), 1);

    while (current <= now) {
      const month = current.getMonth();
      const year = current.getFullYear();

      const monthTickets = moderatorTickets.filter((t) => {
        const d = new Date(t.updatedAt || t.closedAt || t.createdAt);
        return d.getMonth() === month && d.getFullYear() === year;
      });

      const monthSolved = monthTickets.filter(
        (t) => t.status === "Cozuldu" || t.status === "Closed"
      );

      const monthActive = monthTickets.filter(
        (t) => t.status !== "Cozuldu" && t.status !== "Closed"
      );

      months.push({
        label: current.toLocaleDateString("tr-TR", {
          month: "long",
          year: "numeric",
        }),
        total: monthTickets.length,
        solved: monthSolved.length,
        active: monthActive.length,
      });

      current.setMonth(current.getMonth() + 1);
    }

    return months;
  }, [moderator, moderatorTickets]);

  return (
    <>
      <Navbar />

      <div className="moderator-detail-wrapper">
        <div className="moderator-detail-header">
          <div>
            <h1>{moderator?.fullName || moderator?.FullName || "Moderatör Detayı"}</h1>
            <p>{moderator?.email || moderator?.Email}</p>
            <span>
              Kayıt tarihi:{" "}
              {moderator?.createdAt || moderator?.CreatedAt
                ? new Date(moderator.createdAt || moderator.CreatedAt).toLocaleDateString("tr-TR")
                : "-"}
            </span>
          </div>

          <div className="period-filter">
            <label>Performans Dönemi</label>
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="all">Genel</option>
              <option value="today">Bugün</option>
              <option value="week">Bu Hafta</option>
              <option value="month">Bu Ay</option>
              <option value="year">Bu Yıl</option>
            </select>
          </div>
        </div>

        <div className="moderator-kpi-grid">
          <div className="moderator-kpi-card">
            <span>Toplam Şikayet</span>
            <strong>{filteredTickets.length}</strong>
          </div>

          <div className="moderator-kpi-card success">
            <span>Çözdüğü</span>
            <strong>{solved.length}</strong>
          </div>

          <div className="moderator-kpi-card warning">
            <span>Devam Eden</span>
            <strong>{active.length}</strong>
          </div>

          <div className="moderator-kpi-card purple">
            <span>Çözüm Oranı</span>
            <strong>%{solveRate}</strong>
          </div>
        </div>

        <div className="moderator-visual-grid">
          <div className="moderator-chart-card">
            <h2>Çözüm Dağılımı</h2>

            <div
              className="donut-chart"
              style={{
                background: `conic-gradient(#22c55e 0 ${solveRate}%, #f59e0b ${solveRate}% 100%)`,
              }}
            >
              <div className="donut-inner">
                <strong>%{solveRate}</strong>
                <span>Çözüm</span>
              </div>
            </div>

            <div className="legend">
              <div><span className="dot green"></span>Çözülen: {solved.length}</div>
              <div><span className="dot orange"></span>Devam Eden: {active.length}</div>
            </div>
          </div>

          <div className="moderator-chart-card">
            <h2>Memnuniyet Dağılımı</h2>

            <div
              className="donut-chart"
              style={{
                background: `conic-gradient(#3b82f6 0 ${satisfactionRate}%, #ef4444 ${satisfactionRate}% 100%)`,
              }}
            >
              <div className="donut-inner">
                <strong>%{satisfactionRate}</strong>
                <span>Memnun</span>
              </div>
            </div>

            <div className="legend">
              <div><span className="dot blue"></span>Memnun: {approved.length}</div>
              <div><span className="dot red"></span>Memnun Değil: {rejected.length}</div>
            </div>
          </div>
        </div>

        <div className="moderator-table-card">
          <h2>Ay Ay Performans</h2>

          {monthList.map((month, index) => {
            const total = month.total || 1;
            const solvedPercent = Math.round((month.solved / total) * 100);
            const activePercent = Math.round((month.active / total) * 100);

            return (
              <div className="month-performance-row" key={index}>
                <div className="month-info">
                  <strong>{month.label}</strong>
                  <span>Toplam: {month.total} | Çözülen: {month.solved} | Devam Eden: {month.active}</span>
                </div>

                <div className="stacked-bar">
                  <div
                    className="stacked-solved"
                    style={{ width: `${month.total === 0 ? 0 : solvedPercent}%` }}
                  ></div>
                  <div
                    className="stacked-active"
                    style={{ width: `${month.total === 0 ? 0 : activePercent}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="moderator-table-card">
          <h2>Moderatörün Ticketları</h2>

          <table>
            <thead>
              <tr>
                <th>Şikayet</th>
                <th>Durum</th>
                <th>Puan</th>
                <th>Kullanıcı Yorumu</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr key={ticket.ticketId}>
                  <td>{ticket.title}</td>
                  <td>{ticket.status}</td>
                  <td>{ticket.rating ? `${ticket.rating} / 5` : "-"}</td>
                  <td>{ticket.feedbackNote || "-"}</td>
                </tr>
              ))}

              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan="4">Bu dönem için kayıt bulunamadı.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default ModeratorDetailPage;