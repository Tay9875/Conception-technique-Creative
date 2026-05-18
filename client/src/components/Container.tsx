import { ReactNode } from "react";
import "../styles/Container.css";
import { SquareButton } from "./SquareButton.tsx";
import { Button } from "./Button.tsx";

export interface Tag {
  id: number;
  title: string;
}

export type SortType = "Récents" | "Populaires";

interface ContainerProps {
  children: ReactNode;
  tags: Tag[]; 
  selectedTag: number | null;
  onTagChange: (tagId: number | null) => void;
  activeSort: SortType;
  onSortChange: (sort: SortType) => void;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  tags = [],      // <--- CORRECTION 1 : Valeur par défaut (tableau vide)
  selectedTag,
  onTagChange,
  activeSort,
  onSortChange,
}) => {

  return (
    <main className="container" id="main-content">
      
      {/* --- SECTION FILTRES (TAGS) --- */}
      <section className="categoryfilter">
        <nav
          className="filters-nav"
          aria-label="Filtrer les articles par catégorie"
        >
          <ul className="filters-list" role="radiogroup" aria-label="Catégories">
            
            <li>
              <Button
                type="button"
                role="radio"
                aria-checked={selectedTag === null}
                className={selectedTag === null ? "active" : ""}
                onClick={() => onTagChange(null)}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  stars_2
                </span>
                <span>Tous</span>
              </Button>
            </li>

            {/* Le .map ne plantera plus car tags est au moins [] */}
            {tags.map((tag) => (
              <li key={tag.id}>
                <Button
                  type="button"
                  role="radio"
                  aria-checked={selectedTag === tag.id}
                  className={selectedTag === tag.id ? "active" : ""}
                  onClick={() => onTagChange(tag.id)}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    stars_2
                  </span>
                  <span>{tag.title}</span>
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      {/* --- SECTION CONTENU PRINCIPAL --- */}
      <section className="mainContent">
        
        <div className="other-filters" role="radiogroup" aria-labelledby="sort-label">
          <p id="sort-label">Trier par :</p>

          <SquareButton
            role="radio"
            aria-checked={activeSort === "Récents"}
            className={`sqr-button-background ${
              activeSort === "Récents" ? "active" : ""
            }`}
            onClick={() => onSortChange("Récents")}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              stars_2
            </span>
            <span>Récents</span>
          </SquareButton>

          <SquareButton
            role="radio"
            aria-checked={activeSort === "Populaires"}
            className={`sqr-button-background ${
              activeSort === "Populaires" ? "active" : ""
            }`}
            onClick={() => onSortChange("Populaires")}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              chart_data
            </span>
            <span>Populaires</span>
          </SquareButton>
        </div>

        {/* CORRECTION 2 : Ajout de '?.' pour sécuriser le find aussi */}
        <p className="sr-only" aria-live="polite">
          {`Filtre actif : ${selectedTag === null ? "Tous" : tags?.find(t => t.id === selectedTag)?.title}, tri : ${activeSort}`}
        </p>

        <div className="posts-content">{children}</div>
      </section>
    </main>
  );
};
