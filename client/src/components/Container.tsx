import { ReactNode, useCallback, useRef } from "react";
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
  tags?: Tag[];
  selectedTag?: number | null;
  onTagChange?: (tagId: number | null) => void;
  activeSort?: SortType;
  onSortChange?: (sort: SortType) => void;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  tags = [],
  selectedTag = null,
  onTagChange,
  activeSort = "Récents",
  onSortChange,
}) => {
  const tagGroupRef = useRef<HTMLDivElement>(null);
  const sortGroupRef = useRef<HTMLDivElement>(null);

  const handleRadioKeyDown = useCallback(
    (
      e: React.KeyboardEvent<HTMLButtonElement>,
      items: (number | null | SortType)[],
      current: number | null | SortType,
      onChange: ((v: number | null) => void) | ((v: SortType) => void),
      groupRef: React.RefObject<HTMLDivElement | null>
    ) => {
      const idx = items.indexOf(current);
      let nextIdx = idx;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        nextIdx = (idx + 1) % items.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        nextIdx = (idx - 1 + items.length) % items.length;
      } else {
        return;
      }

      (onChange as (v: any) => void)(items[nextIdx]);

      const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>("button[role='radio']");
      buttons?.[nextIdx]?.focus();
    },
    []
  );

  const tagItems: (number | null)[] = [null, ...tags.map((t) => t.id)];
  const sortItems: SortType[] = ["Récents", "Populaires"];
  const showFilters = !!onTagChange && !!onSortChange;

  return (
    <main className="container" id="main-content">

      {showFilters && (
        <>
          <section className="categoryfilter">
            <nav className="filters-nav" aria-label="Filtrer les articles par catégorie">
              <div
                className="filters-list"
                role="radiogroup"
                aria-label="Catégories"
                ref={tagGroupRef}
              >
                <Button
                  type="button"
                  role="radio"
                  aria-checked={selectedTag === null}
                  tabIndex={0}
                  className={selectedTag === null ? "active" : ""}
                  onClick={() => onTagChange(null)}
                  onKeyDown={(e) => handleRadioKeyDown(e, tagItems, selectedTag, onTagChange, tagGroupRef)}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">stars_2</span>
                  <span>Tous</span>
                </Button>

                {tags.map((tag) => (
                  <Button
                    key={tag.id}
                    type="button"
                    role="radio"
                    aria-checked={selectedTag === tag.id}
                    tabIndex={0}
                    className={selectedTag === tag.id ? "active" : ""}
                    onClick={() => onTagChange(tag.id)}
                    onKeyDown={(e) => handleRadioKeyDown(e, tagItems, selectedTag, onTagChange, tagGroupRef)}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">stars_2</span>
                    <span>{tag.title}</span>
                  </Button>
                ))}
              </div>
            </nav>
          </section>

          <div className="other-filters">
            <p id="sort-label">Trier par&nbsp;:</p>
            <div
              role="radiogroup"
              aria-labelledby="sort-label"
              className="sort-group"
              ref={sortGroupRef}
            >
              {sortItems.map((sort) => (
                <SquareButton
                  key={sort}
                  role="radio"
                  aria-checked={activeSort === sort}
                  tabIndex={0}
                  className={`sqr-button-background ${activeSort === sort ? "active" : ""}`}
                  onClick={() => onSortChange(sort)}
                  onKeyDown={(e) => handleRadioKeyDown(e, sortItems, activeSort, onSortChange, sortGroupRef)}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    {sort === "Récents" ? "stars_2" : "chart_data"}
                  </span>
                  <span>{sort}</span>
                </SquareButton>
              ))}
            </div>
          </div>
        </>
      )}

      <section className="mainContent">
        {showFilters && (
          <p className="sr-only" aria-live="polite">
            {`Filtre actif : ${selectedTag === null ? "Tous" : tags?.find(t => t.id === selectedTag)?.title ?? selectedTag}, tri : ${activeSort}`}
          </p>
        )}
        <div className="posts-content">{children}</div>
      </section>
    </main>
  );
};
