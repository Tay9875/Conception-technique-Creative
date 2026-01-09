// client/src/App.js
import React, { useState, useEffect } from 'react';
import Auth from './Auth';
import Feed from './Feed';

function App() {
  const [user, setUser] = useState(null);

  // Vérifier si l'utilisateur est déjà connecté (si on rafraîchit la page)
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <div className="App">
      {user ? (
        <Feed user={user} onLogout={handleLogout} />
      ) : (
        <Auth onLoginSuccess={handleLogin} />
      )}
    </div>
  );
}

export default App;