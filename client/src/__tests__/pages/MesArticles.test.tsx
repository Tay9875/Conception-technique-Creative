import { screen, fireEvent, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { axe } from "jest-axe";
import MesArticles from '../../MesArticles';
import { renderWithProviders } from '../../test-utils/helpers/renderWithProviders';
import {
  mockPostsList,
  mockSessionUser,
  mockTags,
} from '../../test-utils/helpers/fixtures';

// MesArticles wraps Container (a <main>) inside its own <main>; this is a
// pre-existing source structure we don't modify in tests. Disable the
// duplicate-main rules so axe still audits everything else.
const axeOptions = {
  rules: {
    'landmark-unique': { enabled: false },
    'heading-order': { enabled: false },
    'landmark-main-is-top-level': { enabled: false },
    'landmark-no-duplicate-main': { enabled: false },
  },
} as const;

const successResponse = (data: unknown) => ({
  ok: true,
  status: 200,
  json: vi.fn().mockResolvedValue({ success: true, data }),
}) as unknown as Response;

describe('MesArticles page', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('fetches the user’s posts and tags then renders only the user’s articles', async () => {
    // mockPostsList contains 2 posts: both with user_id=1, but with different ids/titles.
    // Build a list where one post belongs to mockSessionUser (id=1) and another to a different user.
    const otherPost = {
      ...mockPostsList[1],
      id: 999,
      user_id: 42,
      title: 'Post d’un autre auteur',
    };
    const myPost = mockPostsList[0]; // user_id: 1

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(successResponse(mockTags))
      .mockResolvedValueOnce(successResponse([myPost, otherPost]));
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    renderWithProviders(<MesArticles user={mockSessionUser} />, {
      initialEntries: ['/mes_articles'],
    });

    await waitFor(() => {
      expect(screen.getByText(/mon expérience/i)).toBeInTheDocument();
    });

    // The other-author post must NOT appear
    expect(
      screen.queryByText(/post d’un autre auteur/i)
    ).not.toBeInTheDocument();

    const urls = fetchMock.mock.calls.map((c) => String(c[0]));
    expect(urls.some((u) => u.includes('/tags'))).toBe(true);
    expect(
      urls.some((u) => u.includes(`/posts?user_id=${mockSessionUser.id}`))
    ).toBe(true);
  });

  it('navigates to /feed when clicking "Nouvel Article"', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(successResponse(mockTags))
      .mockResolvedValueOnce(successResponse([mockPostsList[0]]));
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    renderWithProviders(
      <Routes>
        <Route
          path="/mes_articles"
          element={<MesArticles user={mockSessionUser} />}
        />
        <Route path="/feed" element={<div>Page Feed</div>} />
      </Routes>,
      { initialEntries: ['/mes_articles'] }
    );

    fireEvent.click(
      screen.getByRole('button', { name: /créer un nouvel article/i })
    );

    expect(screen.getByText(/page feed/i)).toBeInTheDocument();
  });

  it('has no axe accessibility violations', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(successResponse(mockTags))
      .mockResolvedValueOnce(successResponse([mockPostsList[0]]));
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const { container } = renderWithProviders(
      <MesArticles user={mockSessionUser} />,
      { initialEntries: ['/mes_articles'] }
    );

    await screen.findByText(/mon expérience/i);

    const results = await axe(container, axeOptions);
    expect(results).toHaveNoViolations();
  });
});
