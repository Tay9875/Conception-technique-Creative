import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import { GlobalSearch } from "./GlobalSearch";

test("opens global search with keyboard shortcut and renders mocked results", async () => {
  const originalFetch = global.fetch;
  const originalResizeObserver = global.ResizeObserver;
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      success: true,
      data: {
        query: "fatigue",
        results: [
          {
            id: "1",
            type: "post",
            title: "Fatigue pendant le traitement",
            snippet: "Conseils pour recuperer.",
            url: "/article/1",
            score: 12,
            meta: { author: "Camille", category: "Effets secondaires" },
          },
        ],
      },
    }),
  });

  render(
    <MemoryRouter>
      <GlobalSearch />
    </MemoryRouter>
  );

  await userEvent.keyboard("{Control>}k{/Control}");
  const input = await screen.findByLabelText(/rechercher un conseil/i);
  await userEvent.type(input, "fatigue");

  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  expect(await screen.findByText("Fatigue pendant le traitement")).toBeInTheDocument();

  global.fetch = originalFetch;
  global.ResizeObserver = originalResizeObserver;
});
