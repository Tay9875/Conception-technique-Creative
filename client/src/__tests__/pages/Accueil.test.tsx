import { screen, waitFor, fireEvent } from '@testing-library/react';
import { axe } from "jest-axe";
import Accueil from '../../Accueil';
import { renderWithProviders } from '../../test-utils/helpers/renderWithProviders';
import { mockPostsList, mockTags } from '../../test-utils/helpers/fixtures';

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

describe('Accueil page', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders the heading, fetches posts and tags, and renders BlogCards', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(successResponse(mockPostsList))
      .mockResolvedValueOnce(successResponse(mockTags));
    globalThis.fetch = fetchMock;

    renderWithProviders(<Accueil user={null} />, { initialEntries: ['/'] });

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /partageons nos expériences/i,
      })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/mon expérience/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/conseils pratiques/i)).toBeInTheDocument();

    // Both endpoints called
    const urls = fetchMock.mock.calls.map((c) => c[0]);
    expect(urls.some((u) => String(u).includes('/posts'))).toBe(true);
    expect(urls.some((u) => String(u).includes('/tags'))).toBe(true);
  });

  it('shows the empty state when no articles match the selected filter', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(successResponse(mockPostsList))
      .mockResolvedValueOnce(successResponse(mockTags));
    globalThis.fetch = fetchMock;

    renderWithProviders(<Accueil user={null} />, { initialEntries: ['/'] });

    // Wait until filter buttons (tags) are rendered.
    const poumonButton = await screen.findByRole('radio', { name: /poumon/i });
    fireEvent.click(poumonButton);

    // No article has tag_id === 3 → empty state shown
    await waitFor(() => {
      expect(
        screen.getByText(/aucun article ne correspond à ce filtre/i)
      ).toBeInTheDocument();
    });
  });

  it('has no axe accessibility violations', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(successResponse(mockPostsList))
      .mockResolvedValueOnce(successResponse(mockTags));
    globalThis.fetch = fetchMock;

    const { container } = renderWithProviders(<Accueil user={null} />, {
      initialEntries: ['/'],
    });

    await screen.findByText(/mon expérience/i);

    const results = await axe(container, axeOptions);
    expect(results).toHaveNoViolations();
  });
});
