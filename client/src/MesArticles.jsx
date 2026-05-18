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

function MesArticles({ user }) {
  const navigate = useNavigate();

  // --- 1. ÉTATS (DATA & UI) ---
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  const [articles, setArticles] = useState([]);
  const [tags, setTags] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- 2. ÉTATS (FILTRES & TRI) ---
  const [selectedTag, setSelectedTag] = useState(null);
  const [activeSort, setActiveSort] = useState("Récents");

  // URL API (Render par défaut, décommente la ligne localhost pour tester en local)
  // --- 3. EFFETS ---
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Chargement initial des données
  useEffect(() => {
    fetchTags();
    console.log("🔍 [DEBUG] Effet de chargement des articles pour l'utilisateur :", user);
    
    // On ne charge les articles que si l'utilisateur est bien identifié
    if (user && user.id) {
      console.log("📡 [DEBUG] Appel de fetchMyArticles car utilisateur connecté.");
      fetchMyArticles();
    }
  }, [user]);

  // --- 4. APPELS API ---
  const fetchTags = async () => {
    try {
      const response = await fetch(`${API_URL}/tags`);
      if (!response.ok) throw new Error("Erreur tags");
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMyArticles = async () => {
    console.log("🔍 [DEBUG] User actuel reçu :", user); // Est-ce que user est null ?
    
    if (!user || !user.id) {
        console.warn("⚠️ [DEBUG] Pas d'ID utilisateur trouvé !");
        return;
    }

    try {
      console.log(`📡 [DEBUG] Fetching : ${API_URL}/posts?user_id=${user.id}`);
      
      const response = await fetch(`${API_URL}/posts?user_id=${user.id}`);
      if (!response.ok) throw new Error("Erreur articles");
      
      const data = await response.json();
      console.log("📦 [DEBUG] Données brutes reçues de l'API :", data);

      // Le filtrage avec logs détaillés
      const myPosts = data.filter((post) => {
          // On vérifie le type (String ou Number ?)
          const isMatch = post.user_id == user.id;
          console.log(`👉 Comparaison : Post UserID (${post.user_id}) [${typeof post.user_id}] vs Moi (${user.id}) [${typeof user.id}] -> Match ? ${isMatch}`);
          return isMatch;
      });
      
      console.log("✅ [DEBUG] Articles finaux mis dans le state :", myPosts);
      setArticles(myPosts);
    } catch (error) {
      console.error(error);
    }
  };

  // --- 5. LOGIQUE DE CRÉATION ---
  const handleNoteSubmit = async (data) => {
    // data contient { title, description, tag_id }
    if (!user || !user.id) return;

    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, user_id: user.id }),
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchMyArticles(); // Recharger la liste pour voir le nouveau post
        setSelectedTag(null); // Réinitialiser les filtres
        setActiveSort("Récents");
      } else {
        console.error("Erreur lors de la création du post");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleClick = () => {
    navigate("/");
  };

  // --- 6. LOGIQUE DE FILTRAGE ET TRI (Affichage) ---
  let displayedArticles = selectedTag
    ? articles.filter((article) => article.tag_id === selectedTag)
    : articles;

  displayedArticles = [...displayedArticles].sort((a, b) => {
    if (activeSort === "Populaires") {
      return (b.like_count || 0) - (a.like_count || 0);
    } else {
      // Par défaut : Récents
      return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  return (
    <>
      <Header theme={theme} setTheme={setTheme} />

      <main>
        {/* En-tête de la page */}
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

          {/* Conteneur principal avec filtres et grille d'articles */}
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
                article={article} // On passe les données du post
                user={user}       // On passe l'user pour gérer le like
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

      {/* Modal pour créer un post */}
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
