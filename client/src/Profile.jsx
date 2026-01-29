// client/src/Profile.jsx
import React, { useState, useEffect } from "react";
import "./Profile.css";
import { Header } from "./components/Header.tsx";
import { SquareButton } from "./components/SquareButton.tsx";
import ProfileForm from "./components/ProfileForm.tsx";
import { useNavigate } from "react-router-dom";

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
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleProfileUpdate = (updatedUser) => {
    // 🔜 prêt pour un fetch API
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
                console.log("Profil mis à jour :", data);
            }}
            />
        </section>
      </main>
    </>
  );
}
