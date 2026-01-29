import './Article.css';
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Header } from './components/Header.tsx';
import AccessibleModal from "./components/AccessibleModal.tsx";
import { SquareButton } from './components/SquareButton.tsx';
import { Tag } from './components/Tags.tsx';
import ReportForm from "./components/ReportForm.tsx";
import { CommentSection } from "./components/CommentSection.tsx";

function Article() {
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [commentsOpen, setCommentsOpen] = useState(false); // pour ouvrir/fermer section commentaires

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const handleNoteSubmit = () => {
        console.log("Signalement envoyé");
        setIsModalOpen(false);
    };

    return (
        <>
        <Header theme={theme} setTheme={setTheme}/>
        <section className="article-container">
            <article className="article">
                <Link to="/" className="article-link">
                    <span className="material-symbols-outlined" aria-hidden="true">
                        arrow_back
                    </span>
                    Retour aux articles
                </Link>

                <main className="article-text" id="main-content">
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
                </main>

                {/* Barre d’outils de l’article */}
                <section className="article-tools" aria-label="Actions sur l’article">
                    <div className="article-appreciation">
                        <SquareButton
                        className="sqr-button-dark-background"
                        onClick={() => console.log("C'est utile, je sauvegarde")}
                        aria-label="Marquer l’article comme utile et le sauvegarder"
                        >
                        <span className="material-symbols-outlined" aria-hidden="true">
                            favorite
                        </span>
                        <span className="sr-only">C'est utile, je sauvegarde</span>
                        </SquareButton>

                        <SquareButton
                        className="sqr-button-dark-background"
                        onClick={() => setCommentsOpen(!commentsOpen)}
                        aria-expanded={commentsOpen}
                        aria-controls="comments-container"
                        aria-haspopup="region"
                        aria-label="Afficher ou masquer les commentaires"
                        >
                        <span className="material-symbols-outlined" aria-hidden="true">
                            sms
                        </span>
                        <span className="sr-only">Commentaires</span>
                        </SquareButton>
                    </div>

                    <SquareButton
                        className="sqr-button-dark-background"
                        onClick={() => setIsModalOpen(true)}
                        aria-label="Signaler cet article"
                    >
                        <span className="material-symbols-outlined" aria-hidden="true">
                        report
                        </span>
                        <span className="sr-only">Signaler</span>
                    </SquareButton>
                    </section>

                {/* Section commentaires */}
                {commentsOpen && <CommentSection isOpen={commentsOpen} />}
            </article>
        </section>

        {/* Modale signalement */}
        <AccessibleModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Signaler"
        >
            <ReportForm onCancel={() => setIsModalOpen(false)} onSubmit={handleNoteSubmit} />
        </AccessibleModal>
        </>
    );
}

export default Article;
