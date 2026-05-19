import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";
import { apiFetch } from "../lib/apiClient";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import "../styles/GlobalSearch.css";

type SearchResultType = "post" | "comment" | "user" | "tag";

type SearchResult = {
  id: string;
  type: SearchResultType;
  title: string;
  snippet: string;
  url: string;
  score: number;
  meta?: {
    author?: string;
    category?: string;
    createdAt?: string;
    commentCount?: number;
    usefulCount?: number;
  };
};

type ApiSearchResponse = {
  query: string;
  results: SearchResult[];
};

const GROUPS: Record<SearchResultType, string> = {
  post: "Conseils",
  comment: "Commentaires",
  user: "Utilisateurs",
  tag: "Thèmes",
};

const TYPE_LABELS: Record<SearchResultType, string> = {
  post: "Conseil",
  comment: "Commentaire",
  user: "Utilisateur",
  tag: "Thème",
};

const shortcutLabel = /Mac|iPhone|iPad|iPod/i.test(navigator.platform) ? "⌘ K" : "Ctrl K";

export const GlobalSearch: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    abortRef.current?.abort();

    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError("");

    const timer = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: trimmed, limit: "10" });
        const data = (await apiFetch(`${API_URL}/search?${params.toString()}`, {
          signal: controller.signal,
        })) as ApiSearchResponse;
        setResults(data.results || []);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError("La recherche est momentanément indisponible.");
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 200);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const groupedResults = useMemo(
    () =>
      (Object.keys(GROUPS) as SearchResultType[]).map((type) => ({
        type,
        title: GROUPS[type],
        results: results.filter((result) => result.type === type),
      })),
    [results]
  );

  const handleSelect = (url: string) => {
    setOpen(false);
    setQuery("");
    navigate(url);
  };

  const resultCount = results.length;
  const status =
    query.trim().length < 2
      ? "Saisissez au moins deux caractères."
      : loading
        ? "Recherche en cours."
        : error || `${resultCount} résultat${resultCount > 1 ? "s" : ""} trouvé${resultCount > 1 ? "s" : ""}.`;

  return (
    <>
      <button
        type="button"
        className="global-search-trigger"
        onClick={() => setOpen(true)}
        aria-label={`Ouvrir la recherche globale, raccourci ${shortcutLabel}`}
      >
        <Search size={18} aria-hidden="true" />
        <span>Rechercher</span>
        <kbd>{shortcutLabel}</kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command shouldFilter={false} loop>
          <div className="global-search-input-row">
            <Search size={20} aria-hidden="true" />
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Rechercher un conseil, un symptôme, un commentaire…"
              aria-label="Rechercher un conseil, un symptôme ou un commentaire"
            />
          </div>

          <p className="global-search-status sr-only" aria-live="polite">
            {status}
          </p>

          <CommandList>
            {query.trim().length < 2 && (
              <CommandEmpty>Saisissez au moins deux caractères pour lancer la recherche.</CommandEmpty>
            )}
            {loading && <CommandEmpty>Recherche en cours…</CommandEmpty>}
            {error && <CommandEmpty>{error}</CommandEmpty>}
            {!loading && !error && query.trim().length >= 2 && resultCount === 0 && (
              <CommandEmpty>Aucun résultat public ne correspond à cette recherche.</CommandEmpty>
            )}

            {!loading &&
              !error &&
              groupedResults.map((group) =>
                group.results.length > 0 ? (
                  <CommandGroup key={group.type} heading={group.title}>
                    {group.results.map((result) => (
                      <CommandItem
                        key={`${result.type}-${result.id}`}
                        value={`${result.type}-${result.id}-${result.title}`}
                        onSelect={() => handleSelect(result.url)}
                      >
                        <div className="global-search-result">
                          <div className="global-search-result-top">
                            <span className={`global-search-badge global-search-badge-${result.type}`}>
                              {TYPE_LABELS[result.type]}
                            </span>
                            {result.meta?.category && <span className="global-search-meta">{result.meta.category}</span>}
                          </div>
                          <strong>{result.title}</strong>
                          {result.snippet && <p>{result.snippet}</p>}
                          <div className="global-search-result-bottom">
                            {result.meta?.author && <span>{result.meta.author}</span>}
                            {result.meta?.usefulCount ? <span>{result.meta.usefulCount} utile(s)</span> : null}
                            {result.meta?.commentCount ? <span>{result.meta.commentCount} commentaire(s)</span> : null}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : null
              )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
};
