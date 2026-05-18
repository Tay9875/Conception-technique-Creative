import "./Accueil.css";
import React, { useState, useEffect } from "react";
import { Header } from "./components/Header.tsx";
import { Container } from "./components/Container.tsx";
import { BlogCard } from "./components/BlogCard.tsx";
import { Empty } from "./components/Empty.tsx";
import { Footer } from "./components/Footer.tsx";
import BottomNav from "./components/BottomNav.tsx";
import { API_URL } from "./config/api";

function Accueil({ user }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  const [articles, setArticles] = useState([]);
  const [tags, setTags] = useState([]);
  
  const [selectedTag, setSelectedTag] = useState(null);
  const [activeSort, setActiveSort] = useState("Récents");

  // Gestion du Thème
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);
  
  useEffect(() => {
    fetchArticles();
    fetchTags();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch(`${API_URL}/posts`);
      if (!response.ok) throw new Error("Erreur chargement articles");
      const data = await response.json();
      setArticles(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch(`${API_URL}/tags`);
      if (!response.ok) throw new Error("Erreur chargement tags");
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error(error);
    }
  };
  
  let displayedArticles = selectedTag
    ? articles.filter((article) => article.tag_id === selectedTag)
    : articles;
    
  displayedArticles = [...displayedArticles].sort((a, b) => {
    if (activeSort === "Populaires") {
      return (b.like_count || 0) - (a.like_count || 0);
    } else {
      return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  return (
    <>
      <Header theme={theme} setTheme={setTheme} />

      {/* INTRO */}
      <section className="section">
        <div className="section-container">
          <div className="section-heading">
            <h1>Partageons nos expériences, soutenons-nous mutuellement</h1>
          </div>
          <div className="section-paragraph">
            <p>
              Bienvenue sur notre espace d'entraide où les patients
              peuvent échanger des conseils et se soutenir.
            </p>
          </div>
        </div>
      </section>

      {/* CONTENU (Avec passage des props dynamiques au Container) */}
      <Container
        tags={tags}
        selectedTag={selectedTag}
        onTagChange={setSelectedTag}
        activeSort={activeSort}
        onSortChange={setActiveSort}
      >
        {displayedArticles.length > 0 ? (
          displayedArticles.map((article) => (
            <BlogCard key={article.id} article={article} user={user} />
          ))
        ) : (
          <Empty aria-label="Aucun article disponible">
            <p className="empty-text">
              Aucun article ne correspond à ce filtre.
            </p>
          </Empty>
        )}
      </Container>

      <Footer />
      <BottomNav />
    </>
  );
}

export default Accueil;
