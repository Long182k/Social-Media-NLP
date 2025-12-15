import { StateCreator } from "zustand";
import { useAppStore } from "..";
import {
  ChatMessageResponse,
  ChatRoom,
  ChatStore,
} from "../../@util/interface/chat.interface";
import { axiosClient } from "../../api/axiosConfig";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const createChatState: StateCreator<ChatStore> = (set, get) => ({
  messages: [],
  selectedChatRoom: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  fetchContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosClient.get("/users");
      return res.data;
    } catch (error) {
      console.log("error", error);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  fetchAvailableContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosClient.get("/users/available-contact");
      return res.data;
    } catch (error) {
      console.log("error", error);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  useContactsQuery: () => {
    return useQuery({
      queryKey: ["contacts"],
      queryFn: async () => {
        const res = await axiosClient.get("/users");
        return res.data;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  },

  getChatRoom: async (currentUserId: string): Promise<ChatRoom[]> => {
    try {
      const res = await axiosClient.get(`/chat/room/${currentUserId}`);

      return res.data;
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      return [];
    }
  },

  useChatRoomsQuery: (currentUserId: string) => {
    return useQuery({
      queryKey: ["chatRooms", currentUserId],
      enabled: !!currentUserId,
      queryFn: async () => {
        const res = await axiosClient.get(`/chat/room/${currentUserId}`);
        return res.data as ChatRoom[];
      },
    });
  },

  getMessages: async (chatRoomId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosClient.get(`/chat/message/${chatRoomId}`);

      set({ messages: res.data });

      return res.data;
    } catch (error) {
      console.log("error", error);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  useMessagesQuery(chatRoomId?: string) {
    const messages = useQuery({
      queryKey: ["messages", chatRoomId],
      enabled: !!chatRoomId,
      queryFn: async () => {
        const res = await axiosClient.get(`/chat/message/${chatRoomId}`);
        return res.data;
      },
    });

    set({ messages: messages.data || [] });
  },

  sendMessage: async (messageData) => {
    const { messages } = get();
    const socket = useAppStore.getState().socket;

    try {
      const res = await axiosClient.post("/chat/message/send", messageData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (socket && socket.connected) {
        socket.emit("sendMessage", res.data);
      } else {
        console.warn("Socket not connected, message sent via HTTP only");
      }

      set({ messages: [...messages, res.data] });
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  },

  useSendMessageMutation() {
    const queryClient = useQueryClient();
    const socket = useAppStore.getState().socket;

    return useMutation({
      mutationFn: async (messageData: any) => {
        const res = await axiosClient.post("/chat/message/send", messageData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data;
      },
      onSuccess: (data: any, variables: any) => {
        // Emit via socket
        if (socket) socket.emit("sendMessage", data);

        // Update store messages
        useAppStore.setState((state) => ({
          messages: [...state.messages, data],
        }));

        // Update cache for this chat room (assumes messageData contains chatRoomId)
        const roomId = variables?.chatRoomId ?? data?.chatRoomId;
        if (roomId) {
          queryClient.setQueryData(
            ["messages", roomId],
            (old: ChatMessageResponse[] = []) => [...old, data]
          );
        }
      },
    });
  },

  createDirectChat: async (directChatData) => {
    const { messages } = get();
    try {
      const res = await axiosClient.post("/chat/room", directChatData);

      set({ messages: [...messages, res.data] });

      return res.data;
    } catch (error) {
      console.log("error", error);
    }
  },

  useCreateDirectChatMutation(currentUserId?: string) {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (directChatData: any) => {
        const res = await axiosClient.post("/chat/room", directChatData);
        return res.data;
      },
      onSuccess: (data: any, variables: any) => {
        // Optionally append to store messages if it’s represented there
        useAppStore.setState((state) => ({
          messages: [...state.messages, data],
        }));

        // Invalidate the chat rooms list for the current user to refetch
        const uid = currentUserId ?? variables?.currentUserId;
        if (uid) {
          queryClient.invalidateQueries({ queryKey: ["chatRooms", uid] });
        }
      },
    });
  },

  subscribeToMessages: () => {
    const { socket, connectSocket } = useAppStore.getState();

    if (!socket) {
      console.log("no socket subscribeToMessages");
      connectSocket();
      return;
    }

    socket.on("newMessage", (newMessage) => {
      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAppStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
  },

  setSelectedChatRoom: (selectedChatRoom: ChatRoom) =>
    set({ selectedChatRoom }),
});
