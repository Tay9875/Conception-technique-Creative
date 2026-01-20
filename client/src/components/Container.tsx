import { ReactNode, useState } from "react";
import "../styles/Container.css";
import { SquareButton } from "./SquareButton.tsx";
import { Button } from "./Button.tsx";

const filters = [
  "Tous",
  "Nutrition",
  "Activité",
  "Vie sociale",
  "Soutien",
  "Fatigue",
  "Nausées",
  "Douleur",
  "Sommeil",
];

interface ContainerProps {
  children: ReactNode;
}

export const Container: React.FC<ContainerProps> = ({ children }) => {
  const [activeFilter, setActiveFilter] = useState("Tous");
  const [sort, setSort] = useState<"Récents" | "Populaires">("Récents");

  return (
    <section className="container">
      {/* FILTRES PRINCIPAUX */}
      <section className="categoryfilter">
        <nav className="filters-nav" aria-label="Sujets">
          <ul className="filters-list">
            {filters.map((label) => (
              <li key={label}>
                <Button
                  type="button"
                  aria-pressed={activeFilter === label}
                  onClick={() => setActiveFilter(label)}
                >
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                  >
                    stars_2
                  </span>
                  <span>{label}</span>
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      {/* CONTENU PRINCIPAL */}
      <section className="mainContent">
        {/* TRI */}
        <div
          className="other-filters"
          role="group"
          aria-labelledby="sort-label"
        >
          <p id="sort-label">Trier par :</p>

          <SquareButton
            className="sqr-button-background"
            aria-pressed={sort === "Récents"}
            onClick={() => setSort("Récents")}
          >
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
            >
              stars_2
            </span>
            <span>Récents</span>
          </SquareButton>

          <SquareButton
            className="sqr-button-background"
            aria-pressed={sort === "Populaires"}
            onClick={() => setSort("Populaires")}
          >
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
            >
              chart_data
            </span>
            <span>Populaires</span>
          </SquareButton>
        </div>

        {/* POSTS */}
        <div className="posts-content">
          {children}
        </div>
      </section>
    </section>
  );
};
