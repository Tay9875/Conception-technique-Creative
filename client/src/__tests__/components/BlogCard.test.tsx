import { screen, fireEvent, waitFor } from '@testing-library/react';
import { BlogCard } from '../../components/BlogCard';
import { renderWithProviders } from '../../test-utils/helpers/renderWithProviders';
import { mockPost, mockSessionUser } from '../../test-utils/helpers/fixtures';

const originalFetch = globalThis.fetch;

function mockJsonResponse(body: unknown, init: { status?: number; ok?: boolean } = {}) {
  const status = init.status ?? 200;
  return {
    ok: init.ok ?? (status >= 200 && status < 300),
    status,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe('BlogCard', () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('renders the article title, author, tag and like count', () => {
    renderWithProviders(<BlogCard article={mockPost} user={null} />);

    expect(screen.getByText(mockPost.title)).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`${mockPost.firstname} ${mockPost.lastname}`, 'i'))
    ).toBeInTheDocument();
    expect(screen.getByText(mockPost.tag_title as string)).toBeInTheDocument();
    expect(screen.getByText(String(mockPost.like_count))).toBeInTheDocument();
  });

  it('alerts the visitor when the like button is clicked without a user', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    renderWithProviders(<BlogCard article={mockPost} user={null} />);

    // The like button contains the like count.
    const likeButton = screen
      .getByText(String(mockPost.like_count))
      .closest('button') as HTMLButtonElement;
    fireEvent.click(likeButton);

    expect(alertSpy).toHaveBeenCalledWith(
      expect.stringMatching(/connecter pour aimer/i)
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('optimistically updates the count and label when an authenticated user likes', async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValue(mockJsonResponse({ success: true, data: { liked: true } }));
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    renderWithProviders(<BlogCard article={mockPost} user={mockSessionUser} />);

    const likeButton = screen
      .getByText(String(mockPost.like_count))
      .closest('button') as HTMLButtonElement;

    fireEvent.click(likeButton);

    // Optimistic update happens synchronously: count goes from 5 -> 6 and icon becomes "favorite".
    expect(screen.getByText(String(mockPost.like_count + 1))).toBeInTheDocument();
    expect(screen.getByText('favorite')).toBeInTheDocument();

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining(`/posts/${mockPost.id}/like`),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('asks for confirmation when the report button is clicked', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    renderWithProviders(<BlogCard article={mockPost} user={mockSessionUser} />);

    const flagIcon = screen.getByText('flag');
    const reportButton = flagIcon.closest('button') as HTMLButtonElement;
    fireEvent.click(reportButton);

    expect(confirmSpy).toHaveBeenCalledWith(
      expect.stringMatching(/signaler ce contenu/i)
    );
    // Confirm returned false, so no fetch call should be made.
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
