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

type SortType = "Récents" | "Populaires";

interface ContainerProps {
  children: ReactNode;
  onCategoryChange?: (category: string) => void;
  onSortChange?: (sort: SortType) => void;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  onCategoryChange,
  onSortChange,
}) => {
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [activeSort, setActiveSort] = useState<SortType>("Récents");

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    onCategoryChange?.(category);
  };

  const handleSortChange = (sort: SortType) => {
    setActiveSort(sort);
    onSortChange?.(sort);
  };

  return (
    <section className="container">
      {/* FILTRES CATÉGORIES */}
      <section className="categoryfilter">
        <nav
          className="filters-nav"
          aria-label="Filtrer les articles par catégorie"
        >
          <ul
            className="filters-list"
            role="radiogroup"
            aria-labelledby="category-filter-label"
          >
            <li id="category-filter-label" className="sr-only">
              Catégories
            </li>

            {filters.map((label) => (
              <li key={label}>
                <Button
                  type="button"
                  role="radio"
                  aria-checked={activeCategory === label}
                  aria-current={activeCategory === label ? "true" : undefined}
                  className={activeCategory === label ? "active" : ""}
                  onClick={() => handleCategoryChange(label)}
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

      {/* CONTENU */}
      <section className="mainContent">
        {/* TRI */}
        <div
          className="other-filters"
          role="radiogroup"
          aria-labelledby="sort-label"
        >
          <p id="sort-label">Trier par :</p>

          <SquareButton
            role="radio"
            aria-checked={activeSort === "Récents"}
            aria-current={activeSort === "Récents" ? "true" : undefined}
            className={`sqr-button-background ${activeSort === "Récents" ? "active" : ""}`}
            onClick={() => handleSortChange("Récents")}
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
            role="radio"
            aria-checked={activeSort === "Populaires"}
            aria-current={activeSort === "Populaires" ? "true" : undefined}
            className={`sqr-button-background ${activeSort === "Populaires" ? "active" : ""}`}
            onClick={() => handleSortChange("Populaires")}
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

        {/* ANNONCE CHANGEMENT (lecteurs d’écran) */}
        <p className="sr-only" aria-live="polite">
          {`Filtre actif : ${activeCategory}, tri : ${activeSort}`}
        </p>

        {/* POSTS */}
        <div className="posts-content">
          {children}
        </div>
      </section>
    </section>
  );
};
