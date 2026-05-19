import { render, screen } from '@testing-library/react';
import { Tag } from '../../components/Tags';

describe('Tag', () => {
  it('renders its children as text', () => {
    render(<Tag>Bien-être</Tag>);
    expect(screen.getByText('Bien-être')).toBeInTheDocument();
  });

  it('wraps children inside a <span class="tag">', () => {
    const { container } = render(<Tag>Sein</Tag>);
    const span = container.querySelector('span.tag');
    expect(span).not.toBeNull();
    expect(span).toHaveTextContent('Sein');
  });

  it('renders complex children', () => {
    render(
      <Tag>
        <strong>Poumon</strong>
      </Tag>
    );
    expect(screen.getByText('Poumon').tagName).toBe('STRONG');
  });
});
