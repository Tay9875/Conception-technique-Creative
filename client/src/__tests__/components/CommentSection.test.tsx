import { fireEvent, screen, waitFor } from '@testing-library/react';
import { CommentSection } from '../../components/CommentSection';
import { renderWithProviders } from '../../test-utils/helpers/renderWithProviders';
import { mockComments, mockSessionUser } from '../../test-utils/helpers/fixtures';

const originalFetch = globalThis.fetch;

function mockJsonResponse(body: unknown, init: { status?: number; ok?: boolean } = {}) {
  const status = init.status ?? 200;
  return {
    ok: init.ok ?? (status >= 200 && status < 300),
    status,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe('CommentSection', () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = renderWithProviders(
      <CommentSection isOpen={false} articleId={10} user={mockSessionUser} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('fetches and renders comments when open', async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValue(mockJsonResponse({ success: true, data: mockComments }));
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    renderWithProviders(
      <CommentSection isOpen={true} articleId={10} user={mockSessionUser} />
    );

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/comments/10'),
        expect.anything()
      );
    });

    expect(await screen.findByText(mockComments[0].description)).toBeInTheDocument();
    expect(
      screen.getByText(
        new RegExp(`${mockComments[0].firstname} ${mockComments[0].lastname}`, 'i')
      )
    ).toBeInTheDocument();
  });

  it('shows the empty state when no comments are returned', async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValue(mockJsonResponse({ success: true, data: [] }));
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    renderWithProviders(
      <CommentSection isOpen={true} articleId={10} user={mockSessionUser} />
    );

    expect(
      await screen.findByText(/Soyez le premier à commenter/i)
    ).toBeInTheDocument();
  });

  it('posts a new comment and re-fetches the list', async () => {
    const fetchSpy = vi
      .fn()
      // Initial fetch returns empty list.
      .mockResolvedValueOnce(mockJsonResponse({ success: true, data: [] }))
      // POST response.
      .mockResolvedValueOnce(mockJsonResponse({ success: true, data: { id: 99 } }))
      // Re-fetch after POST.
      .mockResolvedValueOnce(mockJsonResponse({ success: true, data: mockComments }));
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    renderWithProviders(
      <CommentSection isOpen={true} articleId={10} user={mockSessionUser} />
    );

    // Wait for initial empty state.
    await screen.findByText(/Soyez le premier/i);

    fireEvent.change(screen.getByLabelText(/Commentaires/i), {
      target: { value: 'Mon commentaire' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer/i }));

    await waitFor(() => {
      // Initial GET + POST + re-fetch = 3 calls.
      expect(fetchSpy).toHaveBeenCalledTimes(3);
    });

    // POST call should target /comments with the correct body.
    const postCall = fetchSpy.mock.calls[1];
    expect(postCall[0]).toEqual(expect.stringContaining('/comments'));
    expect(postCall[1]).toEqual(
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ description: 'Mon commentaire', post_id: 10 }),
      })
    );

    // After the re-fetch the comment list should be visible.
    expect(await screen.findByText(mockComments[0].description)).toBeInTheDocument();
  });
});
