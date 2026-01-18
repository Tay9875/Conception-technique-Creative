// client/src/App.js
import React, { useState, useEffect } from 'react';
import Auth from './Auth';
import Feed from './Feed';
import { Header } from './components/Header.tsx';
import { BlogCard } from './components/BlogCard.tsx';
import { CategoryFilter } from './components/CategoryFilter.tsx';
import { PublishModal } from './components/PublishModal.tsx';
import { PostDetail } from './components/PostDetail.tsx';
import { PersonalNotes } from './components/PersonalNotes.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { RegisterModal } from './components/RegisterModal.tsx';
import { TrendingUp, Sparkles } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);

  // Vérifier si l'utilisateur est déjà connecté (si on rafraîchit la page)
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <div className="App">
      <Header />
      {user ? (
        <Feed user={user} onLogout={handleLogout} />
      ) : (
        <Auth onLoginSuccess={handleLogin} />
      )}
      <BottomNav />
    </div>
  );
}

export default App;