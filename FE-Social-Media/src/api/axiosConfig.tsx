import axios from "axios";
import { apolloClient } from "./apolloClient";
import { useAppStore } from "../store";

const API_URL =
  import.meta.env.VITE_SERVER_URL || "https://social-media-nlp-be.vercel.app";

export const axiosInitialClient = axios.create({
  baseURL: API_URL,
});

export const axiosClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Lazy getter to avoid circular dependency
const getStoreActions = () => {
  // Import dynamically inside function to avoid circular dependency
  return useAppStore.getState();
};

let accessToken: string | undefined = undefined;
let isRefreshing = false;
let pendingQueue: Array<(t: string) => void> = [];

export const setAccessToken = (token: string | undefined) => {
  accessToken = token;

  try {
    const { updateUserInfo } = getStoreActions();
    if (token) {
      updateUserInfo({ accessToken: token });
    }
  } catch (error) {
    console.warn("Store not yet initialized:", error);
  }
};

export const getActiveAccessToken = (): string | undefined => {
  if (accessToken) return accessToken;

  try {
    const storeToken = getStoreActions()?.userInfo?.accessToken;
    if (storeToken) {
      accessToken = storeToken;
      return storeToken;
    }
  } catch (e) {
    // Store might not be initialized yet
  }

  if (typeof window !== "undefined") {
    try {
      const rawStorage = localStorage.getItem("auth_storage");
      if (rawStorage) {
        const parsed = JSON.parse(rawStorage);
        const savedToken = parsed?.state?.userInfo?.accessToken;
        if (savedToken) {
          accessToken = savedToken;
          return savedToken;
        }
      }
    } catch (e) {
      console.warn("Could not read auth_storage:", e);
    }
  }

  return undefined;
};

//  Request Interceptor: Attach token
axiosClient.interceptors.request.use(
  (config) => {
    const activeToken = getActiveAccessToken();
    if (activeToken) {
      config.headers["Authorization"] = `Bearer ${activeToken}`;
    }
    return config;
  },
  (error) => {
    console.error("[Axios Request Error]", error);
    return Promise.reject(error);
  }
);

//  Response Interceptor: Handle 401 / 403 + Log all errors
axiosClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const message = error.response?.data?.message;

    console.error(message ?? "Try Again");

    //  Handle expired token (401)
    if (status === 401 && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        const newToken = await new Promise<string>((resolve) => {
          pendingQueue.push(resolve);
        });
        setAccessToken(newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient(original);
      }

      isRefreshing = true;

      try {
        const { data } = await axiosClient.post("/auth/refresh");
        const newToken = data.accessToken;
        setAccessToken(newToken);

        pendingQueue.forEach((fn) => fn(newToken));
        pendingQueue = [];

        original.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient(original);
      } catch (err) {
        console.error("Session expired. Please log in again.");
        pendingQueue = [];
        setAccessToken(undefined);

        try {
          const { removeUserInfo } = getStoreActions();
          removeUserInfo?.();
        } catch (storeErr) {
          console.warn("Could not access store to remove user info:", storeErr);
        }

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle forbidden (403)
    if (status === 403) {
      console.error("Access denied. Please contact admin.");
    }

    //  Handle all other errors
    return Promise.reject(error);
  }
);

//  Optional proactive refresh on tab visibility
const proactiveRefresh = async () => {
  if (isRefreshing || !accessToken) return;

  isRefreshing = true;
  try {
    const { data } = await axiosClient.post("/auth/refresh");
    const newToken = data.accessToken;
    setAccessToken(newToken);
  } catch (err) {
    console.error("Proactive refresh failed: " + (err as Error).message);
    setAccessToken(undefined);

    try {
      const { removeUserInfo } = getStoreActions();
      removeUserInfo?.();
    } catch (storeErr) {
      console.warn("Could not access store to remove user info:", storeErr);
    }
  } finally {
    isRefreshing = false;
  }
};

if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState === "visible") {
      await proactiveRefresh();
    }
  });

  // window.addEventListener("focus", async () => {
  //   await proactiveRefresh();
  // });
}
