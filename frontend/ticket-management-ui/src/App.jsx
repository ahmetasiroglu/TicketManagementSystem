import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import ModeratorDetailPage from "./pages/ModeratorDetailPage";
import "react-toastify/dist/ReactToastify.css";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import TicketPage from "./pages/TicketPage";
import MyTicketsPage from "./pages/MyTicketsPage";
import ReportsPage from "./pages/ReportsPage";
import CreateModeratorPage from "./pages/CreateModeratorPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tickets" element={<TicketPage />} />
        <Route path="/my-tickets" element={<MyTicketsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/create-moderator" element={<CreateModeratorPage />} />
        <Route path="/moderator-detail/:id" element={<ModeratorDetailPage />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
    </BrowserRouter>
  );
}

export default App;