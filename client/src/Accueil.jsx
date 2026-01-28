import './Accueil.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './components/Header.tsx';
import { Container } from './components/Container.tsx';
import { BlogCard } from './components/BlogCard.tsx';
import { Empty } from './components/Empty.tsx';
import { SquareButton } from './components/SquareButton.tsx';
import { Footer } from './components/Footer.tsx';
import BottomNav from "./components/BottomNav.tsx";

function Accueil() {
    const navigate = useNavigate();
    const [theme, setTheme] = useState(
        () => localStorage.getItem("theme") || "light"
    );

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

  return (
    <>
    <Header theme={theme} setTheme={setTheme}/>
    <section className="section">
        <div className="section-container">
            <div className="section-heading">
                    <h4>Partageons nos expériences, soutenons-nous mutuellement</h4>
            </div>
            <div className="section-paragraph">
                <p>Bienvenue sur notre espace d'entraide où les patients peuvent échanger des conseils, partager leurs astuces et se soutenir dans leur parcours.</p>
            </div>
        </div>
    </section>
    <Container>
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
