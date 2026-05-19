import type { SessionUser } from './models';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role_id?: number;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: SessionUser;
}

export interface RegisterResponse {
  message: string;
}

export interface CreatePostPayload {
  title: string;
  description: string;
  tag_id: number;
}

export interface CreatePostResponse {
  id: number;
}

export interface LikeResponse {
  liked: boolean;
}

export interface ReportResponse {
  banned: boolean;
  message: string;
}

export interface CreateCommentPayload {
  description: string;
  post_id: number;
}

export interface CreateCommentResponse {
  id: number;
}
