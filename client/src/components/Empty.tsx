import { ReactNode } from 'react';
import '../styles/Empty.css';

interface EmptyProps {
  children: ReactNode;
  'aria-label'?: string;
}

export const Empty = ({ children, 'aria-label': ariaLabel = 'Aucun article disponible' }: EmptyProps) => {
  return (
    <section className="empty-state" aria-label={ariaLabel}>
      {children}
    </section>
  );
};
