import React, { useEffect, useState } from "react";
import { Header } from "./components/Header.tsx";
import { SquareButton } from "./components/SquareButton.tsx";
import { API_URL } from "./config/api";
import "./Profile.css";
import "./styles/AdminPanel.css";

const roleLabel = (roleId) => {
  switch (roleId) {
    case 1:
      return "Patient";
    case 2:
      return "Ancien Patient";
    case 3:
      return "Proche";
    case 4:
      return "Administrateur";
    default:
      return "Inconnu";
  }
};

export default function AdminPanel({ user, token }) {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [activeTab, setActiveTab] = useState("users"); // "users" ou "reports"

  const headers = {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!token) return;
    fetchUsers();
    fetchReports();
  }, [token]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        headers,
      });
      if (!response.ok) throw new Error("Impossible de récupérer les utilisateurs.");
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError(true);
      setStatusMessage("Erreur de chargement des utilisateurs.");
    }
  };

  const fetchReports = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/reports`, {
        headers,
      });
      if (!response.ok) throw new Error("Impossible de récupérer les signalements.");
      const data = await response.json();
      setReports(data);
    } catch (err) {
      console.error(err);
      setError(true);
      setStatusMessage("Erreur de chargement des signalements.");
    }
  };

  const handleToggleBan = async (postId, currentlyBanned) => {
    try {
      setError(false);
      const endpoint = currentlyBanned ? "unban" : "ban";
      const response = await fetch(`${API_URL}/admin/posts/${postId}/${endpoint}`, {
        method: "PATCH",
        headers,
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du post.");
      }
      const data = await response.json();
      setStatusMessage(data.message);
      fetchReports();
    } catch (err) {
      console.error(err);
      setError(true);
      setStatusMessage("Impossible de modifier l'état du message.");
    }
  };

  return (
    <>
      <Header theme={theme} setTheme={setTheme} />
      <main className="profile-container" id="main-content">
        <section className="profile-card" aria-labelledby="admin-title">
          <div className="profile-header">
            <h1 id="admin-title">Espace administration</h1>
            <p className="profile-subtitle">
              Gestion des utilisateurs et des publications signalées.
            </p>
          </div>

          {statusMessage && (
            <p className={`status-message ${error ? "error" : "success"}`}>
              {statusMessage}
            </p>
          )}

          {/* Onglets de navigation */}
          <div className="admin-tabs">
            <SquareButton
              className={`admin-tab-button ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              Utilisateurs ({users.length})
            </SquareButton>
            <SquareButton
              className={`admin-tab-button ${activeTab === "reports" ? "active" : ""}`}
              onClick={() => setActiveTab("reports")}
            >
              Signalements ({reports.length})
            </SquareButton>
          </div>

          {/* Vue Utilisateurs */}
          {activeTab === "users" && (
            <div className="admin-panel">
              <h2>Gestion des utilisateurs</h2>
              {users.length === 0 ? (
                <p>Aucun utilisateur trouvé.</p>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Rôle</th>
                        <th>Inscrit le</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((item) => (
                        <tr key={item.id}>
                          <td>{`${item.firstname} ${item.lastname}`}</td>
                          <td>{item.email}</td>
                          <td>{roleLabel(item.role_id)}</td>
                          <td>{new Date(item.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Vue Signalements */}
          {activeTab === "reports" && (
            <div className="admin-panel">
              <h2>Gestion des signalements</h2>
              {reports.length === 0 ? (
                <p>Aucun signalement pour le moment.</p>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID Signal.</th>
                        <th>Article</th>
                        <th>Reporté par</th>
                        <th>Statut</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((report) => (
                        <tr key={report.id}>
                          <td>{report.id}</td>
                          <td>{report.post_title}</td>
                          <td>{`${report.reporter_firstname} ${report.reporter_lastname}`}</td>
                          <td>{report.is_banned ? "Banni" : "Actif"}</td>
                          <td>
                            <SquareButton
                              className="sqr-button-dark-background"
                              onClick={() => handleToggleBan(report.post_id, report.is_banned)}
                            >
                              {report.is_banned ? "Débannir" : "Bannir"}
                            </SquareButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
