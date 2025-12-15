import { Post } from "./post.type";

export type RegisterNewUserParams = {
  email: string;
  username: string;
  password: string;
};

export type LoginParams = {
  username?: string;
  email?: string;
  password: string;
};

type ROLE = "USER" | "ADMIN";

export type User = {
  id: string;
  userId: string;
  userName: string;
  nickName: string;
  email: string;
  role: ROLE;
  displayName: string | null;
  hashedPassword: string;
  hashedRefreshToken: string;
  avatarUrl: string | null;
  coverPageUrl: string | null;
  bio: string | null;
  isActive: boolean;
  createdAt: string;
  dateOfBirth: string | null;
  accessToken?: string;
  refreshToken?: string;
};

export type UserDetail = {
  id: string;
  userName: string;
  nickName: string;
  email: string;
  role: "USER" | "ADMIN" | string;
  hashedPassword: string;
  hashedRefreshToken: string | null;
  avatarUrl: string;
  coverPageUrl: string;
  bio: string | null;
  dateOfBirth: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  posts: Post[];
  comments: Comment[];
  likes: Like[];
};

export type Like = {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
};
