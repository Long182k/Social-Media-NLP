import { SCREEN_MODE } from "../constant/constant";
import { LoginParams, RegisterNewUserParams, User } from "../types/auth.type";
import { SocketInstance } from "./chat.interface";

export interface LoginFormProp {
  onSwitchMode: (mode: SCREEN_MODE) => void;
}

export interface RegisterFormProp {
  onSwitchMode: (mode: SCREEN_MODE) => void;
}

export interface ErrorResponseData {
  message: string;
}

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  userId: string;
  userName: string;
  role: string;
};

export type LogoutResponse = {
  message: string;
};

export type RegisterResponse = {
  id: string;
  userName: string;
  email: string;
  role: string;
  hashedRefreshToken: string | null;
  avatarUrl: string | null;
  coverPageUrl: string | null;
  bio: string | null;
  dateOfBirth: string | null;
  isActive: boolean;
  createdAt: string;
  accessToken: string;
  refreshToken: string;
};

export interface AuthStore {
  accessToken: string | undefined;
  userInfo: User;
  socket: SocketInstance | null;
  onlineUsers: User[];
  isSocketConnected: boolean;
  addUserInfo: (userInfo: User) => void;
  updateUserInfo: (updates: Partial<User>) => void;
  getUserInfo: () => User;
  removeUserInfo: () => void;
  connectSocket: () => void;
  disconnectSocket: () => void;
  signup: (data: RegisterNewUserParams) => Promise<RegisterResponse>;
  login: (data: LoginParams) => Promise<LoginResponse>;
  logout: () => Promise<void>;
}
