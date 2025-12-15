import {
  useApolloClient,
  useMutation,
  useQuery,
  useSubscription,
} from "@apollo/client/react";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import {
  DeleteNotificationData,
  MarkNotificationAsReadData,
  Notification,
  NotificationsData,
} from "../@util/interface/notification.interface";
import {
  DELETE_NOTIFICATION,
  GET_NOTIFICATIONS,
  MARK_NOTIFICATION_AS_READ,
  NOTIFICATION_CREATED_SUBSCRIPTION,
  NOTIFICATION_UPDATED_SUBSCRIPTION,
  TOGGLE_BOOKMARK_NOTIFICATION,
} from "../api/graphql/notifications";

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const client = useApolloClient();

  // Clean up old notification flags from sessionStorage
  useEffect(() => {
    const cleanupNotificationFlags = () => {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith("notification_shown_")) {
          if (Math.random() < 0.1) {
            // 10% chance to clean up on each hook call
            sessionStorage.removeItem(key);
          }
        }
      }
    };

    cleanupNotificationFlags();
  }, []);

  // Query to fetch notifications
  const { data, loading, error, refetch } = useQuery<NotificationsData>(
    GET_NOTIFICATIONS,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  // Mutation to create a notification with optimistic UI
  const [toggleBookmarkNotification] = useMutation<
    { toggleBookmarkNotification: Notification },
    { id: string }
  >(TOGGLE_BOOKMARK_NOTIFICATION, {
    update: (cache, { data }) => {
      if (!data) return;

      const existingNotifications = cache.readQuery<NotificationsData>({
        query: GET_NOTIFICATIONS,
      });

      if (existingNotifications) {
        cache.writeQuery({
          query: GET_NOTIFICATIONS,
          data: {
            notifications: [
              data.toggleBookmarkNotification,
              ...existingNotifications.notifications,
            ],
          },
        });
      }
    },
  });

  const [deleteNotification] = useMutation<
    DeleteNotificationData,
    { id: string }
  >(DELETE_NOTIFICATION, {
    update: (cache, { data }, { variables }) => {
      if (data?.deleteNotification && variables) {
        const existingNotifications = cache.readQuery<NotificationsData>({
          query: GET_NOTIFICATIONS,
        });

        if (existingNotifications) {
          cache.writeQuery({
            query: GET_NOTIFICATIONS,
            data: {
              notifications: existingNotifications.notifications.filter(
                (notification: Notification) => notification.id !== variables.id
              ),
            },
          });
        }
      }
    },
  });

  // Mutation to mark notification as read
  const [markAsRead] = useMutation<MarkNotificationAsReadData, { id: string }>(
    MARK_NOTIFICATION_AS_READ,
    {
      update: (cache, { data }) => {
        if (!data) return;

        const existingNotifications = cache.readQuery<NotificationsData>({
          query: GET_NOTIFICATIONS,
        });

        if (existingNotifications) {
          cache.writeQuery({
            query: GET_NOTIFICATIONS,
            data: {
              notifications: existingNotifications.notifications.map(
                (notification: Notification) =>
                  notification.id === data.markNotificationAsRead.id
                    ? data.markNotificationAsRead
                    : notification
              ),
            },
          });
        }
      },
    }
  );

  // Subscribe to new notifications
  useSubscription<{ notificationCreated: Notification }>(
    NOTIFICATION_CREATED_SUBSCRIPTION,
    {
      onData: ({ data }) => {
        if (data?.data?.notificationCreated) {
          // Check if this notification has already been shown
          const notificationId = data.data.notificationCreated.id;
          const hasBeenShown = sessionStorage.getItem(
            `notification_shown_${notificationId}`
          );

          if (!hasBeenShown) {
            // Mark this notification as shown
            sessionStorage.setItem(
              `notification_shown_${notificationId}`,
              "true"
            );

            // Show the toast
            toast.success(data.data.notificationCreated.content);

            // Update the cache with the new notification
            const existingNotifications =
              client.cache.readQuery<NotificationsData>({
                query: GET_NOTIFICATIONS,
              });

            if (existingNotifications) {
              client.cache.writeQuery({
                query: GET_NOTIFICATIONS,
                data: {
                  notifications: [
                    data.data.notificationCreated,
                    ...existingNotifications.notifications,
                  ],
                },
              });
            }

            queryClient.invalidateQueries({ queryKey: ["posts"] });
          }
        }
      },
      onError: (error) => {
        console.error("Subscription error:", error);
      },
    }
  );

  // Subscribe to notification updates
  useSubscription<{ notificationUpdated: Notification }>(
    NOTIFICATION_UPDATED_SUBSCRIPTION,
    {
      onData: ({ data }) => {
        if (data?.data?.notificationUpdated) {
          // Update the cache with the updated notification
          const existingNotifications =
            client.cache.readQuery<NotificationsData>({
              query: GET_NOTIFICATIONS,
            });

          if (existingNotifications) {
            client.cache.writeQuery({
              query: GET_NOTIFICATIONS,
              data: {
                notifications: existingNotifications.notifications.map(
                  (notification: Notification) =>
                    notification.id === data?.data?.notificationUpdated.id
                      ? data?.data?.notificationUpdated
                      : notification
                ),
              },
            });
          }
        }
      },
    }
  );

  // Helper function to handle marking notification as read
  const handleMarkAsRead = useCallback(
    async (id: string) => {
      try {
        const result = await markAsRead({
          variables: { id },
        });
        return result.data?.markNotificationAsRead;
      } catch (error) {
        console.error("Error marking notification as read:", error);
        throw error;
      }
    },
    [markAsRead]
  );

  // Helper function to handle notification creation
  const handleCreateNotification = useCallback(
    async (id: string) => {
      try {
        const result = await toggleBookmarkNotification({
          variables: {
            id,
          },
        });
        queryClient.invalidateQueries({ queryKey: ["posts"] });

        if (result.data?.toggleBookmarkNotification) {
          return result.data.toggleBookmarkNotification;
        }
      } catch (error) {
        console.error("Error creating notification:", error);
        throw error;
      }
    },
    [toggleBookmarkNotification, queryClient]
  );

  return {
    notifications: data?.notifications || [],
    loading,
    error,
    refetch,
    markAsRead: handleMarkAsRead,
    toggleBookmarkNotification: handleCreateNotification,
    deleteNotification,
  };
};
