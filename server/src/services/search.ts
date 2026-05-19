import MiniSearch from 'minisearch';
import { pool } from '../database/db';

export type SearchResultType = 'post' | 'comment' | 'user' | 'tag';

export type SearchDocument = {
  id: string;
  sourceId: number;
  type: SearchResultType;
  title: string;
  content: string;
  category: string;
  tags: string;
  authorPseudo: string;
  createdAt: string | null;
  url: string;
  usefulCount: number;
  commentCount: number;
  parentTitle?: string;
};

export type RankedSearchResult = {
  id: string;
  type: SearchResultType;
  title: string;
  snippet: string;
  url: string;
  score: number;
  meta: {
    author?: string;
    category?: string;
    createdAt?: string;
    commentCount?: number;
    usefulCount?: number;
  };
};

type SearchIndexCache = {
  expiresAt: number;
  index: MiniSearch<SearchDocument>;
};

const CACHE_TTL_MS = 60_000;
let cachedIndex: SearchIndexCache | null = null;

export const normalizeSearchText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

const displayName = (firstname?: string | null, lastname?: string | null) =>
  [firstname, lastname].filter(Boolean).join(' ').trim() || 'Utilisateur';

const excerpt = (value: string, query: string, maxLength = 150) => {
  const text = value.replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;

  const normalizedText = normalizeSearchText(text);
  const normalizedQuery = normalizeSearchText(query);
  const index = normalizedText.indexOf(normalizedQuery);
  const start = Math.max(0, index === -1 ? 0 : index - 45);
  const end = Math.min(text.length, start + maxLength);
  return `${start > 0 ? '...' : ''}${text.slice(start, end).trim()}${end < text.length ? '...' : ''}`;
};

export const applyRankingBonuses = (doc: SearchDocument, baseScore: number, query: string) => {
  const normalizedQuery = normalizeSearchText(query);
  const exactFields = [doc.title, doc.category, doc.tags, doc.authorPseudo].map(normalizeSearchText);
  const contentFields = [doc.content, doc.parentTitle || ''].map(normalizeSearchText);

  let score = baseScore;
  if (exactFields.some((field) => field === normalizedQuery)) score += 2.5;
  if (exactFields.some((field) => field.startsWith(normalizedQuery))) score += 1.4;
  if (contentFields.some((field) => field.includes(normalizedQuery))) score += 0.4;

  if (doc.usefulCount > 0) score += Math.min(1.5, doc.usefulCount * 0.08);

  if (doc.createdAt) {
    const ageDays = (Date.now() - new Date(doc.createdAt).getTime()) / 86_400_000;
    if (Number.isFinite(ageDays) && ageDays < 60) score += Math.max(0, (60 - ageDays) / 60);
  }

  if (doc.type === 'comment') score *= 0.72;
  if (doc.type === 'post') score += 0.75;

  return Number(score.toFixed(3));
};

export const toSearchResult = (doc: SearchDocument, score: number, query: string): RankedSearchResult => ({
  id: String(doc.sourceId),
  type: doc.type,
  title: doc.title,
  snippet: excerpt(doc.type === 'comment' ? doc.content : doc.content || doc.title, query),
  url: doc.url,
  score,
  meta: {
    author: doc.authorPseudo || undefined,
    category: doc.category || undefined,
    createdAt: doc.createdAt || undefined,
    commentCount: doc.commentCount || undefined,
    usefulCount: doc.usefulCount || undefined
  }
});

export const createSearchIndex = (documents: SearchDocument[]) => {
  const index = new MiniSearch<SearchDocument>({
    fields: ['title', 'category', 'tags', 'authorPseudo', 'content'],
    storeFields: [
      'sourceId',
      'type',
      'title',
      'content',
      'category',
      'tags',
      'authorPseudo',
      'createdAt',
      'url',
      'usefulCount',
      'commentCount',
      'parentTitle'
    ],
    searchOptions: {
      boost: {
        title: 5,
        category: 4,
        tags: 4,
        authorPseudo: 3,
        content: 2
      },
      prefix: true,
      fuzzy: 0.2
    },
    processTerm: (term) => normalizeSearchText(term)
  });
  index.addAll(documents);
  return index;
};

const fetchSearchDocuments = async (): Promise<SearchDocument[]> => {
  const [postRows] = await pool.query(
    `SELECT posts.id, posts.title, posts.description, posts.created_at,
      users.firstname, users.lastname, tags.title AS tag_title,
      COUNT(DISTINCT likes.id) AS like_count,
      COUNT(DISTINCT comments.id) AS comment_count
    FROM posts
    JOIN users ON posts.user_id = users.id
    LEFT JOIN tags ON posts.tag_id = tags.id
    LEFT JOIN likes ON likes.post_id = posts.id
    LEFT JOIN comments ON comments.post_id = posts.id AND comments.is_banned = 0
    WHERE posts.is_banned = 0
    GROUP BY posts.id, users.firstname, users.lastname, tags.title
    ORDER BY posts.created_at DESC
    LIMIT 500`
  );

  const posts = (postRows as any[]).map((row): SearchDocument => {
    const authorPseudo = displayName(row.firstname, row.lastname);
    return {
      id: `post:${row.id}`,
      sourceId: Number(row.id),
      type: 'post',
      title: row.title,
      content: row.description,
      category: row.tag_title || '',
      tags: row.tag_title || '',
      authorPseudo,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
      url: `/article/${row.id}`,
      usefulCount: Number(row.like_count || 0),
      commentCount: Number(row.comment_count || 0)
    };
  });

  const [commentRows] = await pool.query(
    `SELECT comments.id, comments.description, comments.created_at, comments.post_id,
      posts.title AS post_title, tags.title AS tag_title,
      users.firstname, users.lastname
    FROM comments
    JOIN posts ON comments.post_id = posts.id
    JOIN users ON comments.user_id = users.id
    LEFT JOIN tags ON posts.tag_id = tags.id
    WHERE posts.is_banned = 0 AND comments.is_banned = 0
    ORDER BY comments.created_at DESC
    LIMIT 500`
  );

  const comments = (commentRows as any[]).map((row): SearchDocument => ({
    id: `comment:${row.id}`,
    sourceId: Number(row.id),
    type: 'comment',
    title: row.post_title,
    content: row.description,
    category: row.tag_title || '',
    tags: row.tag_title || '',
    authorPseudo: displayName(row.firstname, row.lastname),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    url: `/article/${row.post_id}#comments`,
    usefulCount: 0,
    commentCount: 0,
    parentTitle: row.post_title
  }));

  const [tagRows] = await pool.query('SELECT id, title FROM tags ORDER BY title ASC LIMIT 200');
  const tags = (tagRows as any[]).map((row): SearchDocument => ({
    id: `tag:${row.id}`,
    sourceId: Number(row.id),
    type: 'tag',
    title: row.title,
    content: row.title,
    category: row.title,
    tags: row.title,
    authorPseudo: '',
    createdAt: null,
    url: `/?tag=${encodeURIComponent(String(row.id))}`,
    usefulCount: 0,
    commentCount: 0
  }));

  const [userRows] = await pool.query(
    `SELECT DISTINCT users.id, users.firstname, users.lastname
    FROM users
    JOIN posts ON posts.user_id = users.id
    WHERE posts.is_banned = 0
    LIMIT 200`
  );
  const users = (userRows as any[]).map((row): SearchDocument => {
    const authorPseudo = displayName(row.firstname, row.lastname);
    return {
      id: `user:${row.id}`,
      sourceId: Number(row.id),
      type: 'user',
      title: authorPseudo,
      content: authorPseudo,
      category: '',
      tags: '',
      authorPseudo,
      createdAt: null,
      url: `/?author=${encodeURIComponent(authorPseudo)}`,
      usefulCount: 0,
      commentCount: 0
    };
  });

  return [...posts, ...comments, ...tags, ...users];
};

export const getSearchIndex = async () => {
  if (cachedIndex && cachedIndex.expiresAt > Date.now()) return cachedIndex.index;

  const documents = await fetchSearchDocuments();
  const index = createSearchIndex(documents);
  cachedIndex = { index, expiresAt: Date.now() + CACHE_TTL_MS };
  return index;
};

export const searchGlobal = async (query: string, limit: number): Promise<RankedSearchResult[]> => {
  const index = await getSearchIndex();
  const rawResults = index.search(query);

  return rawResults
    .map((result) => {
      const doc = result as unknown as SearchDocument & { score: number };
      const score = applyRankingBonuses(doc, result.score, query);
      return toSearchResult(doc, score, query);
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};
