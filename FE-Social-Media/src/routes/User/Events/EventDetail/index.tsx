import {
  ArrowLeftOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Layout,
  List,
  Modal,
  Space,
  Typography,
  message,
  Tag,
  Skeleton,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { eventApi } from "../../../../api/event";
import "./index.css";
import { useAppStore } from "../../../../store";

const { Title, Text } = Typography;

interface EventDetailProps {
  isDarkMode: boolean;
}

function EventDetail({ isDarkMode }: EventDetailProps) {
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [membersModalVisible, setMembersModalVisible] = useState(false);
  const [requestsModalVisible, setRequestsModalVisible] = useState(false);
  const { userInfo } = useAppStore();

  const userId = userInfo.userId;

  const eventId = searchParams.get("eventId");

  const fromTab = searchParams.get("from") || "my-events";
  const category = searchParams.get("category");

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => eventApi.getEventById(eventId!),
    select: (data) => data.data,
    enabled: !!eventId,
    retry: false,
    staleTime: 0,
    refetchOnMount: true,
  });

  const { data: requests } = useQuery({
    queryKey: ["eventRequests", eventId],
    queryFn: () => eventApi.getJoinRequests(eventId!),
    enabled: !!eventId,
  });

  const cancelAttendanceMutation = useMutation({
    mutationFn: (cancelledUserId?: string | undefined) =>
      eventApi.cancelAttendance(eventId!, cancelledUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["events", eventId] });

      queryClient.invalidateQueries({ queryKey: ["events", "my-events"] });
      queryClient.invalidateQueries({ queryKey: ["events", "discover"] });
      setRequestsModalVisible(false);

      // console.log("cancelledUserId", cancelledUserId);
      // if (cancelledUserId !== undefined) {
      //   message.success("Cancel join request successfully");
      // } else {
      //   message.success("Left the event successfully");
      // }
    },
  });

  const approveRequestMutation = useMutation({
    mutationFn: (userId: string) => eventApi.approveRequest(eventId!, userId),
    onSuccess: () => {
      message.success("Request approved");
      queryClient.invalidateQueries({ queryKey: ["eventRequests", eventId] });
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      setRequestsModalVisible(false);
    },
  });

  if (!eventId) {
    return <Navigate to="/events" replace />;
  }

  if (isLoading) {
    return (
      <Layout
        style={{
          background: isDarkMode ? "#141414" : "#ffffff",
          minHeight: "100vh",
          width: "100%",
        }}
      >
        <div className="event-detail-container">
          <div className="event-cover-container">
            <Skeleton.Image
              active
              style={{
                height: "350px",
                borderRadius: 0,
              }}
            />
          </div>

          <div
            className="event-info-section"
            style={{
              borderBottom: `1px solid ${isDarkMode ? "#303030" : "#f0f0f0"}`,
              padding: "24px",
            }}
          >
            <div style={{ marginBottom: "24px" }}>
              <Skeleton.Button
                active
                size="large"
                style={{ marginBottom: "16px", width: 200 }}
              />
              <Skeleton active paragraph={{ rows: 2 }} />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <Skeleton.Avatar active size="default" />
              <Skeleton.Avatar active size="default" />
              <Skeleton.Avatar active size="default" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const isAdmin = event?.attendees?.some(
    (attendee) => attendee.userId === userId && attendee.role === "ADMIN"
  );

  const activeMembers = event?.attendees?.filter(
    (attendee) =>
      (attendee.role === "ADMIN" || attendee.role === "ATTENDEE") &&
      attendee.status === "ENROLL"
  );

  const isMember = event?.attendees?.some(
    (attendee) =>
      attendee.userId === userId &&
      attendee.role === "ATTENDEE" &&
      attendee.status === "ENROLL"
  );

  return (
    <Layout
      style={{
        background: isDarkMode ? "#141414" : "#ffffff",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <div className="event-detail-container">
        <div className="event-cover-container">
          <img
            className="event-cover-image"
            src={event?.eventAvatar || "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80"}
            alt={event?.name}
          />
        </div>

        <div
          className="event-info-section"
          style={{
            borderBottom: `1px solid ${isDarkMode ? "#303030" : "#f0f0f0"}`,
          }}
        >
          <div className="event-info-container">
            <Button
              className="back-button"
              icon={<ArrowLeftOutlined />}
              onClick={() => {
                const params = new URLSearchParams();
                params.set("tab", fromTab);
                if (category) {
                  params.set("category", category);
                }
                navigate(`/events`);
              }}
              shape="circle"
              style={{
                background: isDarkMode ? "#1f1f1f" : "#f0f0f0",
                borderColor: isDarkMode ? "#303030" : "#d9d9d9",
                color: isDarkMode ? "#ffffff" : "#000000",
              }}
            />
            <div className="event-info-content">
              <Title
                level={2}
                className="event-title"
                style={{ color: isDarkMode ? "#ffffff" : "#000000" }}
              >
                {event?.name}
              </Title>
              <Space size={4} className="member-info">
                <Tag>
                  <Space>
                    <UserOutlined />
                    {event?.attendeesCount}
                  </Space>
                </Tag>
                <div
                  className="member-avatars"
                  onClick={() => setMembersModalVisible(true)}
                >
                  {activeMembers &&
                    activeMembers?.slice(0, 3).map((member) => (
                      <Avatar
                        key={member.userId}
                        src={member.avatarUrl}
                        className="member-avatar"
                        style={{
                          border: `2px solid ${
                            isDarkMode ? "#141414" : "#ffffff"
                          }`,
                        }}
                      />
                    ))}
                  {activeMembers && activeMembers?.length > 3 && (
                    <Avatar
                      className="more-members"
                      style={{
                        background: isDarkMode ? "#1f1f1f" : "#f0f0f0",
                        color: isDarkMode ? "#ffffff" : "#000000",
                      }}
                    >
                      +{activeMembers?.length - 3}
                    </Avatar>
                  )}
                </div>
              </Space>
              <Space direction="vertical" size={8} className="event-details">
                <Space>
                  <CalendarOutlined />
                  {dayjs(event?.eventDate).format("MMM D, YYYY h:mm A")}
                </Space>
                {event?.address && (
                  <Space>
                    <EnvironmentOutlined />
                    {event?.address}
                  </Space>
                )}
                <Tag color="blue">{event?.category}</Tag>
              </Space>
            </div>
          </div>

          <Space>
            {isAdmin ? (
              <Button
                icon={<TeamOutlined />}
                onClick={() => setRequestsModalVisible(true)}
                style={{
                  background: isDarkMode ? "#1f1f1f" : "#ffffff",
                  borderColor: isDarkMode ? "#303030" : "#d9d9d9",
                  color: isDarkMode ? "#ffffff" : "#000000",
                }}
              >
                View Join Requests
              </Button>
            ) : (
              isMember && (
                <Button
                  type="primary"
                  danger
                  onClick={() => {
                    cancelAttendanceMutation.mutate(undefined);
                    message.success("Left the event successfully");
                    navigate(`/events`);
                  }}
                  loading={cancelAttendanceMutation.isPending}
                >
                  Leave
                </Button>
              )
            )}
          </Space>
        </div>

        <div className="event-description">
          <Title
            level={4}
            style={{ color: isDarkMode ? "#ffffff" : "#000000" }}
          >
            Description
          </Title>
          <Text style={{ color: isDarkMode ? "#ffffff" : "#000000" }}>
            {event?.description}
          </Text>
        </div>
      </div>

      {/* Members Modal */}
      <Modal
        title="Event Members"
        open={membersModalVisible}
        onCancel={() => setMembersModalVisible(false)}
        footer={null}
        className={isDarkMode ? "dark" : ""}
      >
        <List
          dataSource={activeMembers}
          renderItem={(member) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar src={member.avatarUrl} />}
                title={
                  <Text style={{ color: isDarkMode ? "#ffffff" : "#000000" }}>
                    {member.userName}
                  </Text>
                }
                description={
                  <Text type="secondary">
                    {member.role === "ADMIN" ? "Admin" : "Member"}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      </Modal>

      {/* Join Requests Modal */}
      <Modal
        title="Join Requests"
        open={requestsModalVisible}
        onCancel={() => setRequestsModalVisible(false)}
        footer={null}
        className={isDarkMode ? "dark" : ""}
      >
        <List
          dataSource={requests?.data?.requests}
          renderItem={(request) => (
            <List.Item
              actions={[
                <Button
                  type="primary"
                  onClick={() => approveRequestMutation.mutate(request.user.id)}
                  loading={approveRequestMutation.isPending}
                >
                  Approve
                </Button>,
                <Button
                  danger
                  onClick={() => {
                    cancelAttendanceMutation.mutate(request.user.id);
                    message.success("Reject join request successfully");
                  }}
                  loading={cancelAttendanceMutation.isPending}
                >
                  Reject
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar src={request.user.avatarUrl} />}
                title={
                  <Text style={{ color: isDarkMode ? "#ffffff" : "#000000" }}>
                    {request.user.userName}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      </Modal>
    </Layout>
  );
}

export default EventDetail;
