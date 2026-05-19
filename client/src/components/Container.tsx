import { ReactNode } from 'react';
import '../styles/Container.css';
import { SquareButton } from './SquareButton';
import { Button } from './Button';
import type { Tag } from '../types';

export type SortType = 'Récents' | 'Populaires';

interface ContainerProps {
  children: ReactNode;
  tags?: Tag[];
  selectedTag?: number | null;
  onTagChange?: (tagId: number | null) => void;
  activeSort?: SortType;
  onSortChange?: (sort: SortType) => void;
}

export const Container = ({
  children,
  tags = [],
  selectedTag = null,
  onTagChange,
  activeSort = 'Récents',
  onSortChange,
}: ContainerProps) => {
  const showFilters = Boolean(onTagChange || onSortChange);

  return (
    <main className="container" id="main-content">
      {showFilters && onTagChange && (
        <section className="categoryfilter">
          <nav className="filters-nav" aria-label="Filtrer les articles par catégorie">
            <div className="filters-list" role="radiogroup" aria-label="Catégories">
              <Button
                type="button"
                role="radio"
                aria-checked={selectedTag === null}
                className={selectedTag === null ? 'active' : ''}
                onClick={() => onTagChange(null)}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  stars_2
                </span>
                <span>Tous</span>
              </Button>

              {tags.map((tag) => (
                <Button
                  key={tag.id}
                  type="button"
                  role="radio"
                  aria-checked={selectedTag === tag.id}
                  className={selectedTag === tag.id ? 'active' : ''}
                  onClick={() => onTagChange(tag.id)}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    stars_2
                  </span>
                  <span>{tag.title}</span>
                </Button>
              ))}
            </div>
          </nav>
        </section>
      )}

      <section className="mainContent">
        {showFilters && onSortChange && (
          <div className="other-filters" role="radiogroup" aria-labelledby="sort-label">
            <p id="sort-label">Trier par :</p>

            <SquareButton
              role="radio"
              aria-checked={activeSort === 'Récents'}
              className={`sqr-button-background ${activeSort === 'Récents' ? 'active' : ''}`}
              onClick={() => onSortChange('Récents')}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                stars_2
              </span>
              <span>Récents</span>
            </SquareButton>

            <SquareButton
              role="radio"
              aria-checked={activeSort === 'Populaires'}
              className={`sqr-button-background ${activeSort === 'Populaires' ? 'active' : ''}`}
              onClick={() => onSortChange('Populaires')}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                chart_data
              </span>
              <span>Populaires</span>
            </SquareButton>
          </div>
        )}

        {showFilters && (
          <p className="sr-only" aria-live="polite">
            {`Filtre actif : ${
              selectedTag === null
                ? 'Tous'
                : tags.find((t) => t.id === selectedTag)?.title ?? 'Inconnu'
            }, tri : ${activeSort}`}
          </p>
        )}

        <div className="posts-content">{children}</div>
      </section>
    </main>
  );
};
