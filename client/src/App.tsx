import { Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import './App.css';
import Auth from './Auth';
import Feed from './Feed';
import { Header } from './components/Header.tsx';
import { Container } from './components/Container.tsx';
import { BlogCard } from './components/BlogCard.tsx';
import { Empty } from './components/Empty.tsx';
import { SquareButton } from './components/SquareButton.tsx';
import { CategoryFilter } from './components/CategoryFilter.tsx';
import { PublishModal } from './components/PublishModal.tsx';
import { PostDetail } from './components/PostDetail.tsx';
import { PersonalNotes } from './components/PersonalNotes.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { RegisterModal } from './components/RegisterModal.tsx';
import { TrendingUp, Sparkles, Filter } from 'lucide-react';
import { Footer } from './components/Footer.tsx';
import Accueil from "./Accueil.jsx";
import Favoris from "./Favoris.jsx";
import Notes from "./Notes.jsx";

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
        <Route path="/login" element={<Auth onLoginSuccess={setUser} />} />
        <Route path="/logout" element={<Auth onLoginSuccess={undefined} />} />
        <Route path="/favoris" element={<Favoris />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/feed" element={<Feed user={user} onLogout={undefined} />} />
      </Routes>
    </div>
  );
}

export default App;