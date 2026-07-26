import { io } from "socket.io-client";
import { StateCreator } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";
import {
  AuthStore,
  LoginResponse,
  RegisterResponse,
} from "../../@util/interface/auth.interface";
import {
  LoginParams,
  RegisterNewUserParams,
  User,
} from "../../@util/types/auth.type";
import { axiosClient, setAccessToken } from "../../api/axiosConfig";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_SERVER_URL ||
  "https://social-media-nlp-be.vercel.app";

// Configure persist options for AuthStore
const authPersistOptions: PersistOptions<
  AuthStore,
  Pick<AuthStore, "userInfo">
> = {
  name: "auth_storage",
  partialize: (state) => ({
    userInfo: state.userInfo,
  }),
};

// Create AuthStore logic
const createAuthState: StateCreator<AuthStore> = (set, get) => ({
  accessToken: undefined,
  userInfo: {} as User,
  socket: null,
  onlineUsers: [],
  isSocketConnected: false,
  addUserInfo: (userInfo: User) => {
    if (userInfo?.accessToken) {
      setAccessToken(userInfo.accessToken);
    }
    set({ userInfo });
  },
  getUserInfo: () => get().userInfo,
  updateUserInfo: (updates: Partial<User>) =>
    set((state) => {
      const currentUserInfo = state.userInfo;
      if (updates?.accessToken) {
        setAccessToken(updates.accessToken);
      }
      return {
        userInfo:
          currentUserInfo && Object.keys(currentUserInfo).length > 0
            ? { ...currentUserInfo, ...updates }
            : (updates as User),
      };
    }),
  removeUserInfo: () => {
    setAccessToken(undefined);
    set({
      userInfo: undefined,
    });
  },
  signup: async (data: RegisterNewUserParams): Promise<RegisterResponse> => {
    try {
      const { data: response } = await axiosClient.post("/auth/register", data);
      set({ userInfo: response });
      if (response?.accessToken) {
        setAccessToken(response.accessToken);
      }

      get().connectSocket();
      return response;
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  },
  login: async (data: LoginParams): Promise<LoginResponse> => {
    try {
      const { data: dataResponse } = await axiosClient.post(
        "/auth/login",
        data
      );

      set({ userInfo: dataResponse });
      if (dataResponse?.accessToken) {
        setAccessToken(dataResponse.accessToken);
      }

      get().connectSocket();

      return dataResponse;
    } catch (error) {
      console.error("Login error", error);
      throw error; // Rejects the Promise with the error
    }
  },

  logout: async () => {
    try {
      setAccessToken(undefined);
      const res = await axiosClient.post(`/auth/signout`);

      set({
        userInfo: undefined,
        isSocketConnected: false,
      });

      get().disconnectSocket();
      get().removeUserInfo();

      return res.data;
    } catch (error) {
      console.log("error", error);
    }
  },
  connectSocket: () => {
    const { userInfo, socket: existingSocket } = get();

    if (!userInfo) {
      console.log("No user info available for socket connection.");
      return;
    }

    // If socket exists and is already connected, don't create a new one
    if (existingSocket?.connected) {
      console.log("Socket already connected:", existingSocket.id);
      set({ isSocketConnected: true });
      return;
    }

    // Disconnect existing socket if it exists but is not connected
    if (existingSocket && !existingSocket.connected) {
      existingSocket.removeAllListeners();
      existingSocket.disconnect();
    }

    console.log("Creating new socket connection...");

    const socket = io(SOCKET_URL, {
      transports: ["polling", "websocket"],
      query: {
        userId: userInfo.userId,
      },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.connect();

    socket.on("connect", () => {
      console.log("Socket connected successfully:", socket.id);
      set({ isSocketConnected: true });
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      set({ isSocketConnected: false });
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      set({ isSocketConnected: false });
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log("Socket reconnected after", attemptNumber, "attempts");
      set({ isSocketConnected: true });
    });

    socket.on("reconnect_attempt", (attemptNumber) => {
      console.log("Reconnection attempt:", attemptNumber);
    });

    socket.on("reconnect_failed", () => {
      console.error("Socket reconnection failed");
      set({ isSocketConnected: false });
    });

    set({ socket: socket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      set({ socket: null, isSocketConnected: false });
      console.log("Socket disconnected and cleaned up");
    }
  },

  initiateSocket: () => {
    const socket = get().socket;

    if (!socket) {
      get().connectSocket();
    }
  },
});

export const createAuthStore = persist(createAuthState, authPersistOptions);
