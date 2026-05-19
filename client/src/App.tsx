import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Auth from './Auth';
import ProtectedRoute from './components/ProtectedRoutes';
import Feed from './Feed';
import Accueil from './Accueil';
import Favoris from './Favoris';
import Notes from './Notes';
import MesArticles from './MesArticles';
import Article from './Article';
import Profile from './Profile';
import BottomNav from './components/BottomNav';
import AccessibilityButton from './components/AccessibilityButton';
import type { SessionUser } from './types';

function App() {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser) as SessionUser);
      } catch {
        setUser(null);
      }
    }
  }, []);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Accueil user={user} />} />
        <Route path="/article/:id" element={<Article user={user} />} />
        <Route path="/login" element={<Auth onLoginSuccess={setUser} />} />
        <Route path="/logout" element={<Auth />} />
        <Route
          path="/favoris"
          element={
            <ProtectedRoute user={user}>
              <Favoris />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes"
          element={
            <ProtectedRoute user={user}>
              <Notes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mes_articles"
          element={
            <ProtectedRoute user={user}>
              <MesArticles user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feed"
          element={
            <ProtectedRoute user={user}>
              <Feed user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user}>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
      <BottomNav />
      <AccessibilityButton />
    </div>
  );
}

export default App;
