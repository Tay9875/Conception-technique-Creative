import { ReactNode } from 'react';
import '../styles/Tags.css';

interface TagProps {
  children: ReactNode;
}

export const Tag = ({ children }: TagProps) => {
  return <span className="tag">{children}</span>;
};
