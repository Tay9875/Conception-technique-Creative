import { screen, waitFor, fireEvent } from '@testing-library/react';
import { axe } from "jest-axe";
import Feed from '../../Feed';
import { renderWithProviders } from '../../test-utils/helpers/renderWithProviders';
import {
  mockSessionUser,
  mockTags,
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

describe('Feed page', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders the create-article form and fetches tags', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(successResponse(mockTags));
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    renderWithProviders(<Feed user={mockSessionUser} />, {
      initialEntries: ['/feed'],
    });

    expect(
      screen.getByRole('heading', { level: 1, name: /créer un article/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/titre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();

    await waitFor(() => {
      // Tags should populate the select options.
      expect(
        screen.getByRole('option', { name: /bien-être/i })
      ).toBeInTheDocument();
    });
  });

  it('submits a new post when the form is filled and validated', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(successResponse(mockTags))
      .mockResolvedValueOnce(successResponse({ id: 42 }));
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    renderWithProviders(<Feed user={mockSessionUser} />, {
      initialEntries: ['/feed'],
    });

    // Wait until tags are loaded so the select has options
    await screen.findByRole('option', { name: /bien-être/i });

    fireEvent.change(screen.getByLabelText(/titre/i), {
      target: { value: 'Nouveau titre' },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Description du post' },
    });

    fireEvent.click(screen.getByRole('button', { name: /publier/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    const postCall = fetchMock.mock.calls[1];
    expect(String(postCall[0])).toMatch(/\/posts$/);
    expect(postCall[1]?.method).toBe('POST');

    await waitFor(() => {
      expect(
        screen.getByText(/article publié avec succès/i)
      ).toBeInTheDocument();
    });
  });

  it('has no axe accessibility violations', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(successResponse(mockTags)) as unknown as typeof fetch;

    const { container } = renderWithProviders(<Feed user={mockSessionUser} />, {
      initialEntries: ['/feed'],
    });

    await screen.findByRole('option', { name: /bien-être/i });

    const results = await axe(container, axeOptions);
    expect(results).toHaveNoViolations();
  });
});
