import { useEffect } from "react";
import { useAppStore } from "../store";
import { initializeAxiosAuth } from "../api/axiosConfig";

/**
 * Hook to initialize socket connection and axios auth on app mount
 * This ensures socket reconnects and axios has the token after page refresh
 */
export const useSocketInitializer = () => {
  const { userInfo, initializeSocket, isSocketConnected } = useAppStore();

  useEffect(() => {
    // Initialize axios auth with stored token
    initializeAxiosAuth();

    // Initialize socket if user is logged in and socket is not connected
    if (userInfo && userInfo.id && !isSocketConnected) {
      console.log("App mounted: Initializing socket for user:", userInfo.id);
      initializeSocket();
    }

    // Cleanup on unmount
    return () => {
      // We don't disconnect here as the user might be navigating between pages
      console.log("Socket initializer unmounted");
    };
  }, [userInfo?.id, isSocketConnected, initializeSocket]);

  return { isSocketConnected };
};
