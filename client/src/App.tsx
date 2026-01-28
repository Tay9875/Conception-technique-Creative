import { Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import './App.css';
import Auth from './Auth';
import ProtectedRoute from "./components/ProtectedRoutes.tsx";
import Feed from './Feed';
import Accueil from "./Accueil.jsx";
import Favoris from "./Favoris.jsx";
import Notes from "./Notes.jsx";
import Article from "./Article.jsx";
import Profile from "./Profile.jsx";
import BottomNav from "./components/BottomNav.tsx";

function App() {
  const [user, setUser] = useState(null);

  // Vérifier si l'utilisateur est déjà connecté (si on rafraîchit la page)
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);
  
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/article" element={<Article />} />
        <Route path="/login" element={<Auth onLoginSuccess={setUser} />} />
        <Route path="/logout" element={<Auth onLoginSuccess={undefined} />} />
        <Route path="/favoris" element={
          <ProtectedRoute user={user}>
              <Favoris />
            </ProtectedRoute>
          } />
        <Route path="/notes" element={
          <ProtectedRoute user={user}>
              <Notes />
            </ProtectedRoute>} />
        <Route path="/feed" element={
          <ProtectedRoute user={user}>
              <Feed user={user} onLogout={undefined} />
            </ProtectedRoute>} />
        <Route path="/profile" element={
          <ProtectedRoute user={user}>
              <Profile />
            </ProtectedRoute>
          } />
      </Routes>
      <BottomNav/>
    </div>
  );
}

export default App;