import axios from "axios";
import { useAppStore } from "../store";

const { userInfo } = useAppStore.getState();
const API_URL = import.meta.env.VITE_SERVER_URL;

const axiosClient = axios.create({
  baseURL: API_URL,
});

axiosClient.interceptors.request.use((config) => {
  const accessToken = userInfo?.accessToken;

  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return config;
});

export const getChatRoom = (userId: string) =>
  axiosClient.get(`/chat/room/${userId}`);

export const fetchContacts = () => axiosClient.get("/users");

export const getMessages = (chatRoomId: string) => {
  return axiosClient.get(`/chat/message/${chatRoomId}`);
};
