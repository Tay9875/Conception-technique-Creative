import { ReactNode } from 'react';
import '../styles/Empty.css';

interface EmptyProps {
  children: ReactNode;
  'aria-label'?: string;
}

export const Empty = ({ children, 'aria-label': ariaLabel = 'Aucun article disponible' }: EmptyProps) => {
  return (
    <div className="empty-state" role="status" aria-live="polite" aria-label={ariaLabel}>
      {children}
    </div>
  );
};
