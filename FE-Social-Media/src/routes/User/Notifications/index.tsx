import { Avatar, Layout, List, Space, Typography } from "antd";
import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useNotifications } from "../../../hooks/useNotifications";
import "./index.css";

interface NotificationProps {
  isDarkMode: boolean;
}

function Notifications({ isDarkMode }: NotificationProps): JSX.Element {
  // Use the GraphQL hook instead of REST API
  const {
    notifications,
    loading: isLoading,
    markAsRead: markAsReadMutation,
    deleteNotification,
  } = useNotifications();

  const handleDelete = (id: string) => {
    deleteNotification({
      variables: { id },
    })
      .then(() => {
        toast.success("Notification deleted successfully");
      })
      .catch(() => {
        toast.error("Failed to delete notification");
      });
  };

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation(id);
  };

  return (
    <Layout className={`notifications-layout ${isDarkMode ? "dark" : "light"}`}>
      <Typography.Title
        level={1}
        className={`notifications-title ${isDarkMode ? "dark" : "light"}`}
      >
        All Notifications
      </Typography.Title>

      <List
        loading={isLoading}
        itemLayout="horizontal"
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            actions={[
              <Trash2
                key="delete"
                size={16}
                onClick={() => handleDelete(item.id)}
                className={`notification-delete-icon ${
                  isDarkMode ? "dark" : "light"
                }`}
              />,
            ]}
            onClick={() => !item.isRead && handleMarkAsRead(item.id)}
            className={`notification-item ${isDarkMode ? "dark" : "light"} ${
              !item.isRead ? "unread" : ""
            }`}
          >
            <List.Item.Meta
              avatar={
                item.sender.avatarUrl ? (
                  <Avatar src={item.sender.avatarUrl} size={40} />
                ) : (
                  <Avatar size={40}>{item.sender.userName[0]}</Avatar>
                )
              }
              title={
                <Space>
                  <Typography.Text
                    className={`notification-content ${
                      isDarkMode ? "dark" : "light"
                    }`}
                  >
                    {item.content}
                  </Typography.Text>
                </Space>
              }
              description={
                <Typography.Text
                  className={`notification-time ${
                    isDarkMode ? "dark" : "light"
                  }`}
                >
                  {formatDistanceToNow(new Date(item.createdAt), {
                    addSuffix: true,
                  })}
                </Typography.Text>
              }
            />
          </List.Item>
        )}
      />
    </Layout>
  );
}

export default Notifications;
