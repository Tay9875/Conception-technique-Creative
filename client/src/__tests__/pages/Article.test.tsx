import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { axe } from "jest-axe";
import Article from '../../Article';
import { PreferencesProvider } from '../../contexts/PreferencesContext';
import {
  mockPostsList,
  mockSessionUser,
} from '../../test-utils/helpers/fixtures';

const axeOptions = {
  rules: {
    'landmark-unique': { enabled: false },
    'heading-order': { enabled: false },
  },
} as const;

const successResponse = (data: unknown) => ({
  ok: true,
  status: 200,
  json: vi.fn().mockResolvedValue({ success: true, data }),
}) as unknown as Response;

function renderArticle(user: { id: number; firstname: string; lastname: string; role_id: number } | null) {
  return render(
    <MemoryRouter initialEntries={['/article/10']}>
      <PreferencesProvider>
        <Routes>
          <Route path="/article/:id" element={<Article user={user} />} />
        </Routes>
      </PreferencesProvider>
    </MemoryRouter>
  );
}

describe('Article page', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders the article title once data is loaded', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(successResponse(mockPostsList)) as unknown as typeof fetch;

    renderArticle(null);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: /mon expérience/i })
      ).toBeInTheDocument();
    });
  });

  it('lets an authenticated user like the article', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(successResponse(mockPostsList))
      .mockResolvedValueOnce(successResponse({ liked: true }));
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    renderArticle(mockSessionUser);

    const likeButton = await screen.findByRole('button', {
      name: /ajouter aux favoris/i,
    });
    fireEvent.click(likeButton);

    await waitFor(() => {
      // After click, button label flips to "Retirer des favoris"
      expect(
        screen.getByRole('button', { name: /retirer des favoris/i })
      ).toBeInTheDocument();
    });

    // The second fetch call is the like POST
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const likeCall = fetchMock.mock.calls[1];
    expect(String(likeCall[0])).toMatch(/\/posts\/10\/like$/);
    expect(likeCall[1]?.method).toBe('POST');
  });

  it('has no axe accessibility violations', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(successResponse(mockPostsList)) as unknown as typeof fetch;

    const { container } = renderArticle(null);

    await screen.findByRole('heading', { level: 1, name: /mon expérience/i });

    const results = await axe(container, axeOptions);
    expect(results).toHaveNoViolations();
  });
});
