import './Accueil.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Composants
import { Header } from './components/Header.tsx'; // .tsx pas nécessaire dans l'import
import { Container } from './components/Container.tsx';
import { BlogCard } from './components/BlogCard.tsx';
import { Footer } from './components/Footer.tsx';

function Accueil() {
    const navigate = useNavigate();
    
    // --- 1. ÉTATS (DATA) ---
    const [tags, setTags] = useState([]); // Liste des tags
    const [selectedTag, setSelectedTag] = useState(null); // Tag actif
    const [activeSort, setActiveSort] = useState("Récents"); // Tri actif
    
    // Theme management
    const [theme, setTheme] = useState(
        () => localStorage.getItem("theme") || "light"
    );

    // Attention : Utilise ton URL locale pour le développement (Port 3000 ou 3001 selon ton serveur)
    const API_URL = 'http://localhost:3000/api'; 

    // --- 2. EFFETS ---
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    useEffect(() => {
        fetchTags();
    }, []);

    // --- 3. APPEL API ---
    const fetchTags = async () => {
        try {
            const response = await fetch(`${API_URL}/tags`);
            if (!response.ok) throw new Error("Erreur chargement tags");
            const data = await response.json();
            setTags(data); // On met à jour la liste qui sera envoyée au Container
        } catch (error) { 
            console.error("Erreur API Tags:", error); 
        }
    };

    return (
        <>
            <Header theme={theme} setTheme={setTheme}/>
            
            <section className="section">
                <div className="section-container">
                    <div className="section-heading">
                            <h1>Partageons nos expériences, soutenons-nous mutuellement</h1>
                    </div>
                    <div className="section-paragraph">
                        <p>Bienvenue sur notre espace d'entraide où les patients peuvent échanger des conseils, partager leurs astuces et se soutenir dans leur parcours.</p>
                    </div>
                </div>
            </section>

            {/* --- 4. PASSAGE DES PROPS AU CONTAINER --- */}
            {/* C'est ici que la magie opère : on donne les données au design */}
            <Container
                tags={tags}                     // La liste des tags récupérée par l'API
                selectedTag={selectedTag}       // L'état du parent
                onTagChange={setSelectedTag}    // La fonction pour changer l'état
                activeSort={activeSort}         // L'état du tri
                onSortChange={setActiveSort}    // La fonction pour changer le tri
            >
                {/* Pour l'instant tes cartes sont statiques, on verra après pour les rendre dynamiques */}
                <BlogCard />
                <BlogCard />
                <BlogCard />
                <BlogCard />
                <BlogCard />
            </Container>

            <Footer />
        </>
    );
}

export default Accueil;