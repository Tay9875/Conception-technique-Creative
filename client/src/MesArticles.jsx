import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./MesArticles.css";
import AccessibleModal from "./components/AccessibleModal.tsx";
import NoteForm from "./components/NoteForm.tsx";
import { Header } from "./components/Header.tsx";
import { Container } from "./components/Container.tsx";
import { Empty } from "./components/Empty.tsx";
import { SquareButton } from "./components/SquareButton.tsx";
import { Footer } from "./components/Footer.tsx";
import { BlogCard } from "./components/BlogCard.tsx";
import { API_URL } from "./config/api";
import { apiFetch } from "./lib/apiClient";

function MesArticles({ user }) {
  const navigate = useNavigate();

  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  const [articles, setArticles] = useState([]);
  const [tags, setTags] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedTag, setSelectedTag] = useState(null);
  const [activeSort, setActiveSort] = useState("Récents");

  useEffect(() => {
    document.title = "Mes articles — Oncarya";
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    fetchTags();
    if (user && user.id) {
      fetchMyArticles();
    }
  }, [user]);

  const fetchTags = async () => {
    try {
      const data = await apiFetch(`${API_URL}/tags`);
      setTags(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMyArticles = async () => {
    if (!user || !user.id) {
        return;
    }

    try {
      const data = await apiFetch(`${API_URL}/posts?user_id=${user.id}`);

      const myPosts = data.filter((post) => {
          const isMatch = post.user_id == user.id;
          return isMatch;
      });

      setArticles(myPosts);
    } catch (error) {
      console.error(error);
    }
  };

  const handleNoteSubmit = async (data) => {
    if (!user || !user.id) return;

    try {
      await apiFetch(`${API_URL}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(data),
      });

      setIsModalOpen(false);
      fetchMyArticles();
      setSelectedTag(null);
      setActiveSort("Récents");
    } catch (error) {
      console.error(error);
    }
  };

  const handleClick = () => {
    navigate("/");
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

      <main>
            <section className="articles-section">
            <div className="articles-section-container">
              <div className="articles-section-lien">
                <Link to="/" className="retour" aria-label="Retour à la page d'accueil">
            <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
            Retour aux conseils
                </Link>
              </div>

              <div className="articles-section-heading">
                <div className="articles-heading">
            <h1 className="note-heading">Mes Articles</h1>
            <p className="paragraph">Apportez un soutien en partageant vos conseils</p>
                </div>

                <div className="nouvel-article">
                <SquareButton
                  className="sqr-button-dark-background no-resize"
                  onClick={() => navigate("/feed")}
                  aria-label="Créer un nouvel article"
                >
                  <span className="material-symbols-outlined" aria-hidden="true">add</span>
                  Nouvel Article
                </SquareButton>
                </div>
              </div>
            </div>
          </section>

        <Container
          tags={tags}
          selectedTag={selectedTag}
          onTagChange={setSelectedTag}
          activeSort={activeSort}
          onSortChange={setActiveSort}
        >
          {displayedArticles.length > 0 ? (
            displayedArticles.map((article) => (
              <BlogCard
                key={article.id}
                article={article}
                user={user}
              />
            ))
          ) : (
            <Empty aria-label="Aucun article disponible">
              <p className="empty-text">
                Vous n'avez pas encore publié d'articles ou aucun ne correspond au filtre.
              </p>
              <SquareButton
                className="sqr-button-dark-background"
                onClick={handleClick}
                aria-label="Découvrir des conseils et revenir à l'accueil"
              >
                Découvrir des conseils
              </SquareButton>
            </Empty>
          )}
        </Container>
      </main>

      {isModalOpen && (
        <AccessibleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Nouvel Article"
        >
          <NoteForm onSubmit={handleNoteSubmit} tags={tags} />
        </AccessibleModal>
      )}

      <Footer />
    </>
  );
}

export default MesArticles;
