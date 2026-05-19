import { Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import './App.css';
import Auth from './Auth';
import ProtectedRoute from "./components/ProtectedRoutes.tsx";
import Feed from './Feed';
import AdminPanel from './AdminPanel.jsx';
import Accueil from "./Accueil.jsx";
import Favoris from "./Favoris.jsx";
import Notes from "./Notes.jsx";
import MesArticles from "./MesArticles.jsx";
import Article from "./Article.jsx";
import Profile from "./Profile.jsx";
import BottomNav from "./components/BottomNav.tsx";
import AccessibilityButton from './components/AccessibilityButton';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Vérifier si l'utilisateur et le token sont déjà chargés (si on rafraîchit la page)
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);
  
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Accueil user={user} />} />
        <Route path="/article/:id" element={<Article user={user} />} />
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
        <Route path="/mes_articles" element={
          <ProtectedRoute user={user}>
              <MesArticles user={user} />
            </ProtectedRoute>
          } />
        <Route path="/feed" element={
          <ProtectedRoute user={user}>
              <Feed user={user} onLogout={undefined} />
            </ProtectedRoute>} />
        <Route path="/admin" element={
          <ProtectedRoute user={user} requiredRole={4}>
              <AdminPanel user={user} token={token} />
            </ProtectedRoute>
          } />
        <Route path="/profile" element={
          <ProtectedRoute user={user}>
              <Profile />
            </ProtectedRoute>
          } />
      </Routes>
      <BottomNav/>
      <AccessibilityButton />
    </div>
  );
}

export default App;