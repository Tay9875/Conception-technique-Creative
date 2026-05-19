export interface Role {
  id: number;
  name: string;
}

export interface Pathology {
  id: number;
  name: string;
}

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  role_id: number;
  pathology_id?: number | null;
}

export interface SessionUser {
  id: number;
  firstname: string;
  lastname: string;
  role_id: number;
}

export interface Tag {
  id: number;
  title: string;
}

export interface Comment {
  id: number;
  description: string;
  created_at: string;
  user_id: number;
  post_id: number;
  firstname?: string;
  lastname?: string;
}

export interface Post {
  id: number;
  title: string;
  description: string;
  created_at: string;
  user_id: number;
  tag_id: number | null;
}

export interface PostWithDetails extends Post {
  firstname: string;
  lastname: string;
  tag_title: string | null;
  like_count: number;
  is_liked: 0 | 1;
}

export interface PostDetail {
  id: number;
  title: string;
  description: string;
  tag: { title: string } | null;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
}
