import './Article.css';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from './components/Header.tsx';
import AccessibleModal from "./components/AccessibleModal.tsx";
import { SquareButton } from './components/SquareButton.tsx';
import { Tag } from './components/Tags.tsx';
import ReportForm from "./components/ReportForm.tsx";

function Article() {
    const navigate = useNavigate();

    // État pour savoir si la modale est ouverte
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fonction appelée quand le formulaire est soumis
    const handleNoteSubmit = (data) => {
        console.log("Nouvelle note :", data);
        setIsModalOpen(false); // fermer la modale après soumission
    };

  return (
    <>
    <Header />
    <section className="article-container">
        <article className="article">
            <Link to="/" className="article-link">
                <span
                className="material-symbols-outlined"
                aria-hidden="true"
                >
                arrow_back
                </span>
                Retour aux articles
            </Link>
            <div className="text">
                <div className="tags">
                    <Tag>Bien-être</Tag>
                </div>
            
                <div className="main-container">
                    <header className="article-detail-heading">
                        <h3 id="article-title" className="article-title">
                          Commentaires sur la gestion du stress pendant les traitements
                        </h3>
                    </header>
            
                    <p className="article-content">
                        J'ai trouvé que la méditation et les exercices de respiration m'ont beaucoup aidé à gérer le stress lié aux traitements. Cela m'a permis de rester plus calme et concentré sur mon rétablissement.
                    </p>
                </div>
            </div>

            <div className="article-tools">
                <div className="article-appreciation">
                    <SquareButton className="sqr-button-dark-background">
                        <span
                            className="material-symbols-outlined"
                            aria-hidden="true"
                        >
                            favorite
                        </span>
                        Utile
                    </SquareButton>
                    <SquareButton className="sqr-button-dark-background">
                        <span
                            className="material-symbols-outlined"
                            aria-hidden="true"
                        >
                            bookmark
                        </span>
                        Sauvegarder
                    </SquareButton>
                </div>

                <div className="article-report" onClick={() => setIsModalOpen(true)}>
                    <SquareButton className="sqr-button-dark-background">
                        <span
                            className="material-symbols-outlined"
                            aria-hidden="true"
                        >
                            report
                        </span>
                        Signaler
                    </SquareButton>
                </div>
            </div>

            <div className="article-comment-section">
                <SquareButton>
                    <span
                        className="material-symbols-outlined"
                        aria-hidden="true"
                    >
                        sms
                    </span>
                    <span>0 Commentaires</span>
                </SquareButton>
                <div className="article-comments">
                    <div className="comment">
                        <div className="comment-info">
                            <div className="comment-author">
                                <span
                                    className="material-symbols-outlined"
                                    aria-hidden="true"
                                >
                                    person
                                </span>
                                <span className="author">Marie D.</span>
                            </div>
                            <p> - xxx/xx/xxxx</p>
                        </div>
                        <div className="comment-content">
                            <p>Contenu du commentaire</p>
                        </div>
                    </div>
                </div>

            </div>
        </article>
    </section>

    <AccessibleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Signaler"
    >
            <ReportForm onSubmit={handleNoteSubmit} />
    </AccessibleModal>
    </>
  );
}

export default Article;
