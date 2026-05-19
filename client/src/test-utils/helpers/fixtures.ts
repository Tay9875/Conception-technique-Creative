import {
  Comment as CommentType,
  LoginResponse,
  PostWithDetails,
  SessionUser,
  Tag,
  User,
} from '../../types';

export const mockUser: User = {
  id: 1,
  firstname: 'Alice',
  lastname: 'Martin',
  email: 'alice@example.com',
  role_id: 1,
  pathology_id: null,
};

export const mockSessionUser: SessionUser = {
  id: mockUser.id,
  firstname: mockUser.firstname,
  lastname: mockUser.lastname,
  role_id: mockUser.role_id,
};

export const mockLoginResponse: LoginResponse = {
  token: 'access.token.value',
  refreshToken: 'refresh.token.value',
  user: mockSessionUser,
};

export const mockTags: Tag[] = [
  { id: 1, title: 'Bien-être' },
  { id: 2, title: 'Sein' },
  { id: 3, title: 'Poumon' },
];

export const mockPost: PostWithDetails = {
  id: 10,
  title: 'Mon expérience',
  description: 'Une histoire de courage.',
  created_at: '2026-01-15T08:00:00Z',
  user_id: 1,
  tag_id: 1,
  firstname: 'Alice',
  lastname: 'Martin',
  tag_title: 'Bien-être',
  like_count: 5,
  is_liked: 0,
};

export const mockPostsList: PostWithDetails[] = [
  mockPost,
  {
    ...mockPost,
    id: 11,
    title: 'Conseils pratiques',
    description: 'Petits gestes au quotidien.',
    created_at: '2026-02-01T08:00:00Z',
    tag_id: 2,
    tag_title: 'Sein',
    like_count: 12,
    is_liked: 1,
  },
];

export const mockComments: CommentType[] = [
  {
    id: 1,
    description: 'Merci pour ce partage.',
    created_at: '2026-01-16T10:00:00Z',
    user_id: 2,
    post_id: 10,
    firstname: 'Bob',
    lastname: 'Dupont',
  },
];
