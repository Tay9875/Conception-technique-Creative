import "./Accueil.css";
import React, { useState, useEffect } from "react";
import { Header } from "./components/Header.tsx";
import { Container } from "./components/Container.tsx";
import { BlogCard } from "./components/BlogCard.tsx";
import { Empty } from "./components/Empty.tsx";
import { Footer } from "./components/Footer.tsx";
import BottomNav from "./components/BottomNav.tsx";

function Accueil() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);

  const API_URL =
    "https://conception-technique-creative-backend.onrender.com/api";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  /* 🔹 Fetch articles */
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch(`${API_URL}/posts`);
        if (!response.ok) throw new Error("Erreur chargement articles");
        const data = await response.json();
        setArticles(data);
        setFilteredArticles(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchArticles();
  }, []);

  /* 🔹 Filtrage catégorie */
  const handleCategoryChange = (category) => {
    if (category === "Tous") {
      setFilteredArticles(articles);
    } else {
      setFilteredArticles(
        articles.filter(
          (article) => article.tag?.title === category
        )
      );
    }
  };

  /* 🔹 Tri */
  const handleSortChange = (sort) => {
    const sorted = [...filteredArticles];

    if (sort === "Récents") {
      sorted.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    }

    if (sort === "Populaires") {
      sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }

    setFilteredArticles(sorted);
  };

  return (
    <>
      <Header theme={theme} setTheme={setTheme} />

      {/* INTRO */}
      <section className="section">
        <div className="section-container">
          <div className="section-heading">
            <h1>
              Partageons nos expériences, soutenons-nous mutuellement
            </h1>
          </div>
          <div className="section-paragraph">
            <p>
              Bienvenue sur notre espace d'entraide où les patients
              peuvent échanger des conseils et se soutenir.
            </p>
          </div>
        </div>
      </section>

      {/* CONTENU */}
      <Container
        onCategoryChange={handleCategoryChange}
        onSortChange={handleSortChange}
      >
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article) => (
            <BlogCard key={article.id} article={article} />
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
