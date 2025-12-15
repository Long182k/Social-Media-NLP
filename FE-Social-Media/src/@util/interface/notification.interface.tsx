export interface Sender {
  id: string;
  userName: string;
  avatarUrl: string | null;
}

export interface Notification {
  id: string;
  content: string;
  type: string;
  senderId: string;
  receiverId: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  sender: Sender;
}

export interface NotificationsData {
  notifications: Notification[];
}

export interface MarkNotificationAsReadData {
  markNotificationAsRead: Notification;
}

export enum NotificationType {
  LIKE = "LIKE",
  COMMENT = "COMMENT",
  MENTION = "MENTION",
  FOLLOW = "FOLLOW",
  BOOKMARK = "BOOKMARK",
  NEW_JOIN_GROUP_REQUEST = "NEW_JOIN_GROUP_REQUEST",
  APPROVED_JOIN_GROUP_REQUEST = "APPROVED_JOIN_GROUP_REQUEST",
  REJECTED_JOIN_GROUP_REQUEST = "REJECTED_JOIN_GROUP_REQUEST",
  NEW_JOIN_EVENT_REQUEST = "NEW_JOIN_EVENT_REQUEST",
  APPROVED_JOIN_EVENT_REQUEST = "APPROVED_JOIN_EVENT_REQUEST",
  REJECTED_JOIN_EVENT_REQUEST = "REJECTED_JOIN_EVENT_REQUEST",
}

export interface CreateNotificationInput {
  content: string;
  type?: NotificationType;
  senderId: string;
  receiverId: string;
}

export interface CreateNotificationData {
  createNotification: Notification;
}

export interface DeleteNotificationData {
  deleteNotification: boolean;
}
