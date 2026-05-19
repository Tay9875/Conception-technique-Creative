import React, { useState, useEffect } from "react";
import "./Profile.css";
import { Header } from "./components/Header.tsx";
import { SquareButton } from "./components/SquareButton.tsx";
import ProfileForm from "./components/ProfileForm.tsx";
import { useNavigate } from "react-router-dom";
import { API_URL } from "./config/api";

export default function Profile({ onLogout }) {
  const navigate = useNavigate();

  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user && user.id && user.role_id === undefined) {
      fetch(`${API_URL}/users/me`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
        .then(res => res.json())
        .then(data => {
          if (data && data.role_id) {
            const updatedUser = { ...user, role_id: data.role_id };
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
          }
        })
        .catch(err => console.error("Erreur récupération profil:", err));
    }
  }, [user]);

  useEffect(() => {
    document.title = "Mon profil — Oncarya";
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleProfileUpdate = (updatedUser) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    alert("Profil mis à jour");
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <>
      <Header theme={theme} setTheme={setTheme} />

      <main className="profile-container" id="main-content">
        <section className="profile-card" aria-labelledby="profile-title">
            <div className="profile-header" aria-labelledby="profile-header">
                <span
                    className="profile-icon material-symbols-outlined"
                    aria-hidden="true"
                    >
                    account_circle
                </span>
                <p className="profile-subtitle">
                    Modifiez vos informations personnelles
                </p>
                <p className="profile-status" style={{marginTop:8, fontWeight:500}}>
                  Statut : {user.role_id === 1 ? "Patient" : user.role_id === 2 ? "Ancien Patient" : user.role_id === 3 ? "Proche" : "Inconnu"}
                </p>
            </div>

            <div className="sign-out">
              <SquareButton
                className="sign-out-btn"
                onClick={handleLogout}
              >
                Déconnexion
              </SquareButton>
            </div>

          <ProfileForm initialData={{
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
            }}
            onSubmit={(data) => {
            }}
            />
        </section>
      </main>
    </>
  );
}
