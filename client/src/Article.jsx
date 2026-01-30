import "./Article.css";
import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom"; // J'ai ajouté useNavigate au cas où
import { Header } from "./components/Header.tsx";
import AccessibleModal from "./components/AccessibleModal.tsx";
import { SquareButton } from "./components/SquareButton.tsx";
import { Tag } from "./components/Tags.tsx";
import ReportForm from "./components/ReportForm.tsx";
import { CommentSection } from "./components/CommentSection.tsx";

// 1. AJOUT de la prop 'user' pour l'authentification
function Article({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  
  const [article, setArticle] = useState(null);
  const [error, setError] = useState(null);
  
  // États pour les intéractions
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  
  // 2. ÉTATS pour le Like
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const API_URL = "https://conception-technique-creative-backend.onrender.com/api";
  // const API_URL = "http://localhost:3000/api";

  /* 🎨 Thème */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  /* 📡 Récupération de l’article */
  useEffect(() => {
    if (!id) return;

    const fetchArticle = async () => {
      try {
        // Idéalement, faire un call /posts/:id si l'API le permet
        // Ici je garde ta logique de liste complète pour être sûr
        const response = await fetch(`${API_URL}/posts`);
        if (!response.ok) throw new Error("Erreur chargement articles");

        const posts = await response.json();
        // Comparaison souple (String/Number)
        const foundArticle = posts.find((post) => String(post.id) === String(id));

        if (!foundArticle) throw new Error("Article introuvable");

        setArticle(foundArticle);
        
        // 3. INITIALISATION des états du like avec les données reçues
        setIsLiked(foundArticle.is_liked === 1);
        setLikesCount(foundArticle.like_count || 0);

      } catch (err) {
        console.error(err);
        setError("Impossible de charger l’article.");
      }
    };

    fetchArticle();
  }, [id]);

  /* ❤️ FONCTION LIKE */
  const handleLike = async () => {
    if (!user || !user.id) return alert("Veuillez vous connecter pour aimer un article.");

    // Mise à jour Optimiste (Immédiate)
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);

    try {
      await fetch(`${API_URL}/posts/${id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });
    } catch (error) {
      console.error("Erreur like:", error);
      // En cas d'erreur, on pourrait annuler le changement d'état ici
    }
  };

  /* 🚩 FONCTION SIGNALEMENT */
  const handleReport = async () => {
    if (!user || !user.id) return alert("Veuillez vous connecter pour signaler.");

    try {
        const response = await fetch(`${API_URL}/posts/${id}/report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert(data.message || "Signalement pris en compte.");
            setIsModalOpen(false);
            
            // Si l'article est banni suite au signalement, on redirige
            if (data.banned) {
                alert("Cet article a été supprimé par la communauté suite aux signalements.");
                navigate('/');
            }
        } else {
            alert("Erreur : " + data.message);
        }
    } catch (error) {
        console.error(error);
    }
  };

  /* ⏳ Chargement */
  if (!article && !error) {
    return (
      <>
        <Header theme={theme} setTheme={setTheme} />
        <p style={{ padding: "2rem" }}>Chargement de l’article…</p>
      </>
    );
  }

  /* ❌ Erreur */
  if (error) {
    return (
      <>
        <Header theme={theme} setTheme={setTheme} />
        <p style={{ padding: "2rem" }}>{error}</p>
      </>
    );
  }

  return (
    <>
      <Header theme={theme} setTheme={setTheme} />

      <section className="article-container">
        <article className="article">
          {/* 🔙 Retour */}
          <Link to="/" className="article-link">
            <span className="material-symbols-outlined" aria-hidden="true">
              arrow_back
            </span>
            Retour aux articles
          </Link>

          {/* 📄 Contenu */}
          <main className="article-text" id="main-content">
            {/* Gestion sécurisée du tag (tag peut être null) */}
            {(article.tag_title || article.tag?.title) && (
              <div className="tags">
                <Tag>{article.tag_title || article.tag.title}</Tag>
              </div>
            )}

            <div className="main-container">
              <header className="article-detail-heading">
                <h1 id="article-title" className="article-title">
                  {article.title}
                </h1>
                {/* Affichage auteur et date si dispo */}
                <div className="article-meta" style={{fontSize: '0.9rem', color: '#666', marginBottom: '1rem'}}>
                    Par {article.firstname} {article.lastname} • Le {new Date(article.created_at).toLocaleDateString()}
                </div>
              </header>

              <p className="article-content">{article.description}</p>
            </div>
          </main>

          {/* 🧰 Actions */}
          <section className="article-tools" aria-label="Actions sur l’article">
            <div className="article-appreciation">
              
              {/* BOUTON LIKE CONNECTÉ */}
              <SquareButton
                className="sqr-button-dark-background"
                aria-label={isLiked ? "Retirer des favoris" : "Ajouter aux favoris"}
                aria-pressed={isLiked}
                onClick={handleLike}
              >
                <span
                  className="material-symbols-outlined"
                  aria-hidden="true"
                >
                  {isLiked ? "favorite" : "favorite_border"}
                </span>
                {/* On peut afficher le compteur ici si on veut */}
                <span style={{marginLeft: '5px', fontSize: '0.9rem'}}>{likesCount}</span>
              </SquareButton>

              <SquareButton
                className="sqr-button-dark-background"
                aria-expanded={commentsOpen}
                aria-controls="comments-container"
                aria-haspopup="region"
                aria-label="Afficher ou masquer les commentaires"
                onClick={() => setCommentsOpen((prev) => !prev)}
              >
                <span
                  className="material-symbols-outlined"
                  aria-hidden="true"
                >
                  sms
                </span>
              </SquareButton>
            </div>

            <SquareButton
              className="sqr-button-dark-background"
              aria-label="Signaler cet article"
              onClick={() => setIsModalOpen(true)}
            >
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
              >
                report
              </span>
            </SquareButton>
          </section>

          {/* 💬 Commentaires */}
          {commentsOpen && (
            <CommentSection
              id="comments-container"
              isOpen={commentsOpen}
              articleId={article.id}
              user={user} // 4. PASSAGE DE USER AUX COMMENTAIRES
            />
          )}
        </article>
      </section>

      {/* 🚨 Modale signalement */}
      <AccessibleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Signaler cet article"
      >
        <ReportForm
          onCancel={() => setIsModalOpen(false)}
          // 5. CONNEXION DU SUBMIT DU FORMULAIRE A L'API
          onSubmit={handleReport} 
        />
      </AccessibleModal>
    </>
  );
}

export default Article;