import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import Navbar from "../components/Navbar";
import "./ReportsPage.css";

function ReportsPage() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [period, setPeriod] = useState("all");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const ticketResponse = await api.get("/Ticket");
      const userResponse = await api.get("/Auth/users");

      setTickets(ticketResponse.data);
      setUsers(userResponse.data);
    } catch (error) {
      console.error(error);
      toast.error("Rapor verileri alınamadı");
    }
  };

  const getPeriodName = () => {
    if (period === "today") return "Bugun";
    if (period === "week") return "Haftalik";
    if (period === "month") return "Aylik";
    if (period === "year") return "Yillik";
    return "Genel";
  };

  const filterByPeriod = (list) => {
    const now = new Date();

    return list.filter((ticket) => {
      const date = new Date(
        ticket.updatedAt || ticket.closedAt || ticket.createdAt
      );

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
    () => filterByPeriod(tickets),
    [tickets, period]
  );

  const totalTickets = filteredTickets.length;

  const solvedTickets = filteredTickets.filter(
    (t) => t.status === "Cozuldu" || t.status === "Closed"
  );

  const activeTickets = filteredTickets.filter(
    (t) => t.status !== "Cozuldu" && t.status !== "Closed"
  );

  const ratedTickets = filteredTickets.filter((t) => t.rating != null);

  const approvedTickets = ratedTickets.filter(
    (t) => t.isResolvedApproved === true
  );

  const rejectedTickets = ratedTickets.filter(
    (t) => t.isResolvedApproved === false
  );

  const avgRating =
    ratedTickets.length > 0
      ? (
          ratedTickets.reduce((sum, t) => sum + Number(t.rating || 0), 0) /
          ratedTickets.length
        ).toFixed(2)
      : "0.00";

  const successRate =
    ratedTickets.length > 0
      ? Math.round((approvedTickets.length / ratedTickets.length) * 100)
      : 0;

  const solvedRate =
    totalTickets > 0
      ? Math.round((solvedTickets.length / totalTickets) * 100)
      : 0;

  const moderatorStats = useMemo(() => {
    const moderators = users.filter((u) => u.role === 2 || u.Role === 2);

    return moderators.map((moderator) => {
      const moderatorId = moderator.userId || moderator.UserId;

      const assignedTickets = filteredTickets.filter(
        (ticket) => ticket.assignedToUserId === moderatorId
      );

      const solved = assignedTickets.filter(
        (ticket) => ticket.status === "Cozuldu" || ticket.status === "Closed"
      );

      const active = assignedTickets.filter(
        (ticket) => ticket.status !== "Cozuldu" && ticket.status !== "Closed"
      );

      const rated = assignedTickets.filter((ticket) => ticket.rating != null);

      const approved = rated.filter(
        (ticket) => ticket.isResolvedApproved === true
      );

      return {
        id: moderatorId,
        name: moderator.fullName || moderator.FullName,
        email: moderator.email || moderator.Email,
        total: assignedTickets.length,
        solved: solved.length,
        active: active.length,
        rated: rated.length,
        approved: approved.length,
        rejected: rated.length - approved.length,
        solveRate:
          assignedTickets.length > 0
            ? Math.round((solved.length / assignedTickets.length) * 100)
            : 0,
        satisfactionRate:
          rated.length > 0
            ? Math.round((approved.length / rated.length) * 100)
            : 0,
      };
    });
  }, [filteredTickets, users]);

  const exportExcel = () => {
    const summaryData = [
      ["Rapor Dönemi", getPeriodName()],
      ["Toplam Şikayet", totalTickets],
      ["Çözülen Şikayet", solvedTickets.length],
      ["Devam Eden Şikayet", activeTickets.length],
      ["Değerlendirme Sayısı", ratedTickets.length],
      ["Memnuniyet Oranı", `%${successRate}`],
      ["Çözüm Oranı", `%${solvedRate}`],
      ["Ortalama Puan", avgRating],
    ];

    const moderatorData = moderatorStats.map((m) => ({
      Moderatör: m.name,
      Email: m.email,
      "Toplam Şikayet": m.total,
      Çözdüğü: m.solved,
      "Devam Eden": m.active,
      "Çözüm Oranı": `%${m.solveRate}`,
      Memnuniyet: `%${m.satisfactionRate}`,
    }));

    const feedbackData = ratedTickets.map((t) => ({
      Şikayet: t.title,
      Puan: `${t.rating} / 5`,
      Sonuç: t.isResolvedApproved
        ? "Sorunum Çözüldü"
        : "Sorunum Çözülmedi",
      Yorum: t.feedbackNote || "Yorum bırakılmamış",
    }));

    const workbook = XLSX.utils.book_new();

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    const moderatorSheet = XLSX.utils.json_to_sheet(moderatorData);
    const feedbackSheet = XLSX.utils.json_to_sheet(feedbackData);

    XLSX.utils.book_append_sheet(workbook, summarySheet, "Genel Rapor");
    XLSX.utils.book_append_sheet(workbook, moderatorSheet, "Moderatorler");
    XLSX.utils.book_append_sheet(workbook, feedbackSheet, "Geri Bildirimler");

    XLSX.writeFile(workbook, `TicketFlow_${getPeriodName()}_Rapor.xlsx`);
    toast.success("Excel raporu indirildi");
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("TicketFlow Admin Raporu", 14, 18);

    doc.setFontSize(11);
    doc.text(`Rapor Donemi: ${getPeriodName()}`, 14, 28);

    autoTable(doc, {
      startY: 36,
      head: [["Baslik", "Deger"]],
      body: [
        ["Toplam Sikayet", totalTickets],
        ["Cozulen Sikayet", solvedTickets.length],
        ["Devam Eden Sikayet", activeTickets.length],
        ["Degerlendirme Sayisi", ratedTickets.length],
        ["Memnuniyet Orani", `%${successRate}`],
        ["Cozum Orani", `%${solvedRate}`],
        ["Ortalama Puan", avgRating],
      ],
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 12,
      head: [
        [
          "Moderator",
          "Email",
          "Toplam",
          "Cozdugu",
          "Devam",
          "Cozum Orani",
          "Memnuniyet",
        ],
      ],
      body: moderatorStats.map((m) => [
        m.name,
        m.email,
        m.total,
        m.solved,
        m.active,
        `%${m.solveRate}`,
        `%${m.satisfactionRate}`,
      ]),
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 12,
      head: [["Sikayet", "Puan", "Sonuc", "Yorum"]],
      body: ratedTickets.map((t) => [
        t.title,
        `${t.rating} / 5`,
        t.isResolvedApproved ? "Sorunum Cozuldu" : "Sorunum Cozulmedi",
        t.feedbackNote || "Yorum birakilmamis",
      ]),
    });

    doc.save(`TicketFlow_${getPeriodName()}_Rapor.pdf`);
    toast.success("PDF raporu indirildi");
  };

  return (
    <>
      <Navbar />

      <div className="reports-wrapper">
        <div className="reports-header">
          <div>
            <h1>Admin Raporlama Paneli</h1>
            <p>
              Şikayetlerin genel durumunu, çözüm oranlarını ve moderatör
              performansını buradan takip edebilirsin.
            </p>
          </div>

          <div className="period-filter">
            <label>Rapor Dönemi</label>

            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="all">Genel</option>
              <option value="today">Bugün</option>
              <option value="week">Bu Hafta</option>
              <option value="month">Bu Ay</option>
              <option value="year">Bu Yıl</option>
            </select>

            <div className="export-buttons">
              <button onClick={exportPDF}>PDF İndir</button>
              <button onClick={exportExcel}>Excel İndir</button>
            </div>
          </div>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card">
            <span>Toplam Şikayet</span>
            <strong>{totalTickets}</strong>
            <p>Seçilen dönemde oluşan toplam kayıt</p>
          </div>

          <div className="kpi-card success">
            <span>Çözülen</span>
            <strong>{solvedTickets.length}</strong>
            <p>Çözüldü durumuna geçen şikayetler</p>
          </div>

          <div className="kpi-card warning">
            <span>Devam Eden</span>
            <strong>{activeTickets.length}</strong>
            <p>Hâlâ işlemde olan şikayetler</p>
          </div>

          <div className="kpi-card purple">
            <span>Ortalama Puan</span>
            <strong>{avgRating}</strong>
            <p>Kullanıcı değerlendirme ortalaması</p>
          </div>
        </div>

        <div className="visual-grid">
          <div className="chart-card">
            <h2>Genel Çözüm Durumu</h2>

            <div
              className="donut-chart"
              style={{
                background: `conic-gradient(#22c55e 0 ${solvedRate}%, #f59e0b ${solvedRate}% 100%)`,
              }}
            >
              <div className="donut-inner">
                <strong>{solvedRate}%</strong>
                <span>Çözüm</span>
              </div>
            </div>

            <div className="legend">
              <div>
                <span className="legend-dot green"></span>
                Çözülen: {solvedTickets.length}
              </div>
              <div>
                <span className="legend-dot orange"></span>
                Devam Eden: {activeTickets.length}
              </div>
            </div>
          </div>

          <div className="chart-card">
            <h2>Kullanıcı Memnuniyeti</h2>

            <div
              className="donut-chart"
              style={{
                background: `conic-gradient(#3b82f6 0 ${successRate}%, #ef4444 ${successRate}% 100%)`,
              }}
            >
              <div className="donut-inner">
                <strong>{successRate}%</strong>
                <span>Memnun</span>
              </div>
            </div>

            <div className="legend">
              <div>
                <span className="legend-dot blue"></span>
                Memnun: {approvedTickets.length}
              </div>
              <div>
                <span className="legend-dot red"></span>
                Memnun Değil: {rejectedTickets.length}
              </div>
            </div>
          </div>
        </div>

        <div className="report-table-card">
          <h2>Sayısal Genel Rapor</h2>

          <table>
            <thead>
              <tr>
                <th>Rapor Başlığı</th>
                <th>Değer</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Toplam şikayet sayısı</td>
                <td>{totalTickets}</td>
              </tr>
              <tr>
                <td>Çözülen şikayet sayısı</td>
                <td>{solvedTickets.length}</td>
              </tr>
              <tr>
                <td>Devam eden şikayet sayısı</td>
                <td>{activeTickets.length}</td>
              </tr>
              <tr>
                <td>Kullanıcı değerlendirmesi yapılan şikayet sayısı</td>
                <td>{ratedTickets.length}</td>
              </tr>
              <tr>
                <td>Memnuniyet oranı</td>
                <td>%{successRate}</td>
              </tr>
              <tr>
                <td>Çözüm oranı</td>
                <td>%{solvedRate}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="report-table-card">
          <h2>Moderatör Performans Raporu</h2>

          <table>
            <thead>
              <tr>
                <th>Moderatör</th>
                <th>Email</th>
                <th>Toplam Şikayet</th>
                <th>Çözdüğü</th>
                <th>Devam Eden</th>
                <th>Çözüm Oranı</th>
                <th>Memnuniyet</th>
              </tr>
            </thead>
            <tbody>
              {moderatorStats.map((mod) => (
                <tr key={mod.id}>
                  <td>
                    <Link
                      to={`/moderator-detail/${mod.id}`}
                      className="moderator-detail-link"
                    >
                      {mod.name}
                    </Link>
                  </td>
                  <td>{mod.email}</td>
                  <td>{mod.total}</td>
                  <td>{mod.solved}</td>
                  <td>{mod.active}</td>
                  <td>
                    <div className="progress-cell">
                      <div className="progress-bar">
                        <span style={{ width: `${mod.solveRate}%` }}></span>
                      </div>
                      %{mod.solveRate}
                    </div>
                  </td>
                  <td>
                    <div className="progress-cell">
                      <div className="progress-bar blue">
                        <span
                          style={{ width: `${mod.satisfactionRate}%` }}
                        ></span>
                      </div>
                      %{mod.satisfactionRate}
                    </div>
                  </td>
                </tr>
              ))}

              {moderatorStats.length === 0 && (
                <tr>
                  <td colSpan="7">Sistemde moderatör bulunamadı.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="report-table-card">
          <h2>Kullanıcı Geri Bildirim Detayları</h2>

          <table>
            <thead>
              <tr>
                <th>Şikayet</th>
                <th>Puan</th>
                <th>Sonuç</th>
                <th>Yorum</th>
              </tr>
            </thead>
            <tbody>
              {ratedTickets.map((ticket) => (
                <tr key={ticket.ticketId}>
                  <td>{ticket.title}</td>
                  <td>{ticket.rating} / 5</td>
                  <td>
                    {ticket.isResolvedApproved
                      ? "Sorunum Çözüldü"
                      : "Sorunum Çözülmedi"}
                  </td>
                  <td>{ticket.feedbackNote || "Yorum bırakılmamış"}</td>
                </tr>
              ))}

              {ratedTickets.length === 0 && (
                <tr>
                  <td colSpan="4">Henüz değerlendirme yapılmamış.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default ReportsPage;