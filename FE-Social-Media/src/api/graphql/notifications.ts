import { gql } from "@apollo/client";

export const NOTIFICATION_FRAGMENT = gql`
  fragment NotificationFields on Notification {
    id
    content
    type
    senderId
    receiverId
    isRead
    createdAt
    updatedAt
    sender {
      id
      userName
      avatarUrl
    }
  }
`;

export const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    notifications {
      ...NotificationFields
    }
  }
  ${NOTIFICATION_FRAGMENT}
`;

export const MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkNotificationAsRead($id: ID!) {
    markNotificationAsRead(id: $id) {
      ...NotificationFields
    }
  }
  ${NOTIFICATION_FRAGMENT}
`;

export const CREATE_NOTIFICATION = gql`
  mutation CreateNotification($input: CreateNotificationInput!) {
    createNotification(input: $input) {
      ...NotificationFields
    }
  }
  ${NOTIFICATION_FRAGMENT}
`;

export const TOGGLE_BOOKMARK_NOTIFICATION = gql`
  mutation ToggleBookmarkNotification($id: ID!) {
    toggleBookmarkNotification(id: $id) {
      ...NotificationFields
    }
  }
  ${NOTIFICATION_FRAGMENT}
`;

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id)
  }
`;

export const NOTIFICATION_CREATED_SUBSCRIPTION = gql`
  subscription OnNotificationCreated {
    notificationCreated {
      ...NotificationFields
    }
  }
  ${NOTIFICATION_FRAGMENT}
`;

export const NOTIFICATION_UPDATED_SUBSCRIPTION = gql`
  subscription OnNotificationUpdated {
    notificationUpdated {
      ...NotificationFields
    }
  }
  ${NOTIFICATION_FRAGMENT}
`;
