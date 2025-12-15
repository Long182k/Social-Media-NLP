import { axiosClient } from "./axiosConfig";

export interface NotificationResponse {
  id: string;
  content: string;
  type: string;
  senderId: string;
  receiverId: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    userName: string;
    avatarUrl: string | null;
  };
}

export const notificationApi = {
  findAll: () => axiosClient.get<NotificationResponse[]>(`/notification`),

  remove: (id: string) => axiosClient.delete(`/notification/${id}`),

  updateIsRead: (id: string) => axiosClient.patch(`/notification/${id}/read`),
};
