import { useMutation, useQuery } from "@tanstack/react-query";
import { Avatar, Button, Card, Layout, List, Space, Typography } from "antd";
import { useState } from "react";
import { toast } from "react-toastify";
import {
  formatDateTime,
  getBackgroundColor,
  getTextColor,
} from "../../../@util/helpers";
import { followUser, getSuggestedUsers } from "../../../api/auth";
import { eventApi } from "../../../api/event";
import "./index.css";
import { SiderRightProps } from "./interface";
const { Title, Text } = Typography;
const { Sider } = Layout;

function SiderRight2({ isDarkMode }: SiderRightProps): JSX.Element {
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: myEventsData } = useQuery({
    queryKey: ["events", "my-events"],
    select: (data) => ({
      ...data,
      events: data.data.events
        .sort(
          (a, b) =>
            new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
        )
        .slice(0, 2),
    }),
    queryFn: () => eventApi.getMyEvents(),
  });

  // Get suggested users query with larger limit
  const { data: mySuggestedUsers, refetch: refetchSuggestedUsers } = useQuery({
    queryKey: ["suggestedUsers", page],
    queryFn: () => getSuggestedUsers(page, 10),
    select: (data) => {
      const suggestions = data.suggestions || [];
      if (suggestions.length < 3 && page > 1) {
        // If we don't have enough users, reset to page 1
        setPage(1);
        return [];
      }
      return suggestions.slice(0, 3); // Always return exactly 3 users if available
    },
  });

  // Follow user mutation
  const followUserMutation = useMutation({
    mutationFn: followUser,
    onSuccess: () => {
      // Force refresh suggested users data
      refetchSuggestedUsers();
    },
    onError: (error) => {
      toast.error("Failed to follow user");
      console.error(error);
    },
  });

  // Handle ignore click
  const handleIgnore = () => {
    setPage((prev) => prev + 1);
  };

  // Only render if we have users to show
  const renderSuggestedUsers = () => {
    if (!mySuggestedUsers || mySuggestedUsers.length === 0) {
      return null;
    }

    return mySuggestedUsers.map((user) => (
      <Card
        key={user.id}
        style={{ ...getBackgroundColor(isDarkMode), marginBottom: 16 }}
      >
        <List.Item>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Avatar size={64} src={user.avatarUrl} />
            <div style={{ marginLeft: 16 }}>
              <Text strong style={getTextColor(isDarkMode)}>
                {user.userName}
              </Text>
              <div style={{ marginTop: 4 }}>
                <Text
                  style={{
                    color: isDarkMode ? "#ffffff99" : "#00000073",
                  }}
                >
                  {user.bio || "No bio"}
                </Text>
              </div>
              <Space style={{ marginTop: 16 }}>
                <Button
                  type="primary"
                  style={{
                    backgroundColor: "#ff4d4f",
                    borderColor: "#ff4d4f",
                  }}
                  onClick={() => {
                    setSelectedUserId(user.id);
                    followUserMutation.mutate(user.id);
                  }}
                  loading={
                    followUserMutation.isPending && selectedUserId === user.id
                  }
                >
                  Follow
                </Button>
                <Button
                  type="default"
                  style={{
                    ...getTextColor(isDarkMode),
                    backgroundColor: isDarkMode ? "#1f1f1f" : "",
                  }}
                  onClick={handleIgnore}
                >
                  Ignore
                </Button>
              </Space>
            </div>
          </div>
        </List.Item>
      </Card>
    ));
  };

  return (
    <Sider
      width={300}
      breakpoint="lg"
      collapsedWidth="0"
      theme={isDarkMode ? "dark" : "light"}
      style={{
        ...getBackgroundColor(isDarkMode),
      }}
    >
      {/* {renderSuggestedUsers()} */}

      {/* <Card
        title={<span style={getTextColor(isDarkMode)}>Upcoming Events</span>}
        style={{ marginTop: "16px", ...getBackgroundColor(isDarkMode) }}
      >
        {myEventsData?.events.map((event) => (
          <Card.Grid
            key={event.name}
            style={{
              width: "100%",
              margin: "16px 16px 0px 16px",
              backgroundImage:
                "linear-gradient(to right, #c6ffdd, #fbd786, #f7797d)",
              borderRadius: "12px",
            }}
          >
            <Title level={5} style={{ color: "#000000" }}>
              {event.name}
            </Title>
            <Text style={{ color: "#000000" }}>
              {formatDateTime(event.eventDate)}
            </Text>
            <div style={{ color: "#000000" }}>
              {event.activeAttendeesCount} Attendees
            </div>
          </Card.Grid>
        ))}
      </Card> */}
    </Sider>
  );
}

export default SiderRight2;
