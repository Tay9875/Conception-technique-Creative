import { render, screen } from '@testing-library/react';
import { CommentCard } from '../../components/CommentCard';

describe('CommentCard', () => {
  const props = {
    author: 'Bob Dupont',
    date: '2026-01-15T08:00:00Z',
    content: 'Merci pour ce partage.',
  };

  it('renders the author name', () => {
    render(<CommentCard {...props} />);
    expect(screen.getByText('Bob Dupont')).toBeInTheDocument();
  });

  it('renders the comment content', () => {
    render(<CommentCard {...props} />);
    expect(screen.getByText('Merci pour ce partage.')).toBeInTheDocument();
  });

  it('renders the date formatted in French (contains "janvier" or "15")', () => {
    const { container } = render(<CommentCard {...props} />);
    const time = container.querySelector('time');
    expect(time).not.toBeNull();
    const text = time?.textContent ?? '';
    expect(text).toMatch(/janvier|15/);
  });

  it('uses the raw ISO date as the time dateTime attribute', () => {
    const { container } = render(<CommentCard {...props} />);
    const time = container.querySelector('time');
    expect(time).toHaveAttribute('datetime', '2026-01-15T08:00:00Z');
  });
});
