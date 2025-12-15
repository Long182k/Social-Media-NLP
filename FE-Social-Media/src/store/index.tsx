import { create } from "zustand";
import { AuthStore } from "../@util/interface/auth.interface";
import { createAuthStore } from "./slices/auth";
import { ChatStore } from "../@util/interface/chat.interface";
import { createChatState } from "./slices/chat";
import { createPostStore, PostStore } from "./slices/post";

export const useAppStore = create<AuthStore & ChatStore & PostStore>(
  (set, get, api) => ({
    ...createAuthStore(set, get, api),
    ...createChatState(set, get, api),
    ...createPostStore(set, get, api),
  })
);
