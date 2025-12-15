import {
  CalendarOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Layout,
  Modal,
  Row,
  Select,
  Space,
  Tabs,
  Tag,
  Upload,
} from "antd";
import { UploadFile } from "antd/es/upload/interface";
import dayjs from "dayjs";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  CreateEventCategory,
  Event,
  eventApi,
  EventCategory,
} from "../../../../api/event";
import { useAppStore } from "../../../../store";
import "./index.css";

interface ExploreProps {
  isDarkMode: boolean;
}

interface EventFormValues {
  name: string;
  description: string;
  eventDate: dayjs.Dayjs;
  category?: EventCategory;
  address?: string;
  eventAvatar?: UploadFile;
}

function EventList({ isDarkMode }: ExploreProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm<EventFormValues>();
  const queryClient = useQueryClient();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const { userInfo } = useAppStore();

  const userId = userInfo.userId;

  const navigate = useNavigate();
  const [joiningEventId, setJoiningEventId] = useState<string | null>(null);

  const currentTab = searchParams.get("tab") || "my-events";
  const currentCategory = searchParams.get("category") as EventCategory;
  const page = parseInt(searchParams.get("page") || "1");

  // Queries
  const myEvents = useQuery({
    queryKey: ["events", "my-events", page],
    queryFn: () => eventApi.getMyEvents(page),
    enabled: currentTab === "my-events",
  });

  const discoveryEvents = useQuery({
    queryKey: ["events", "discover", page],
    queryFn: () => eventApi.getDiscoveryEvents(page),
    enabled: currentTab === "discover",
  });

  const categoryEvents = useQuery({
    queryKey: ["events", "category", currentCategory, page],
    queryFn: () => eventApi.getEventsByCategory(currentCategory, page),
    enabled:
      !!currentCategory &&
      currentCategory !== "TRENDING" &&
      currentTab === "discover",
  });

  // Add trending events query
  const trendingEvents = useQuery({
    queryKey: ["events", "trending"],
    queryFn: () => eventApi.getTrendingEvents(),
    enabled: currentTab === "discover" && currentCategory === "TRENDING",
  });

  // Mutations
  const createEventMutation = useMutation({
    mutationFn: (data: FormData) => eventApi.createEvent(data),
    onSuccess: () => {
      toast.success("Event created successfully");
      setCreateModalVisible(false);
      form.resetFields();
      setFileList([]);
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const joinEventMutation = useMutation({
    mutationFn: (eventId: string) => {
      setJoiningEventId(eventId);
      return eventApi.joinEvent(eventId);
    },
    onSuccess: () => {
      toast.success("Join request sent");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["eventRequests"] });
      setJoiningEventId(null);
    },
    onError: () => {
      setJoiningEventId(null);
    },
  });

  const handleTabChange = (key: string) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("tab", key);
      if (key === "discover") {
        newParams.delete("category");
      }
      return newParams;
    });
  };

  const handleCategoryChange = (value: string | undefined) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (value) {
        newParams.set("category", value);
      } else {
        newParams.delete("category");
      }
      newParams.set("tab", currentTab);
      return newParams;
    });
  };

  const handleCreateEvent = async (values: any) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("description", values.description);
    formData.append("eventDate", values.eventDate.toISOString());
    if (values.category) {
      formData.append("category", values.category);
    }
    if (values.address) {
      formData.append("address", values.address);
    }

    const file = fileList[0]?.originFileObj;
    if (file) {
      formData.append("eventAvatar", file);
    }

    createEventMutation.mutate(formData);
  };

  const isFormValid = () => {
    const values = form.getFieldsValue();
    const requiredFields = ["name", "description", "eventDate"] as const;
    const hasRequiredFields = requiredFields.every(
      (field) => values[field] !== undefined && values[field] !== ""
    );

    return hasRequiredFields;
  };

  const renderEventCard = (event: Event) => {
    const isCreator = event.creator.id === userInfo?.userId;
    const hasPendingRequest = event.attendees?.some(
      (attendee) =>
        attendee.userId === userInfo?.userId &&
        attendee.role === "PENDING_ATTENDEE"
    );

    const isAttendee = event.attendees?.some(
      (attendee) =>
        attendee.userId === userInfo?.userId &&
        (attendee.role === "ADMIN" || attendee.role === "ATTENDEE") &&
        attendee.status === "ENROLL"
    );

    const handleCardClick = () => {
      const params = new URLSearchParams();
      params.set("eventId", event.id);
      if (currentCategory) {
        params.set("category", currentCategory);
      }

      const isEventMember = event.attendees?.some(
        (attendee) =>
          attendee.userId === userId &&
          (attendee.role === "ADMIN" || attendee.role === "ATTENDEE") &&
          attendee.status === "ENROLL"
      );

      if (isEventMember) {
        navigate(`/events/detail?${params.toString()}`, {
          replace: true,
        });
      } else if (currentTab === "my-events") {
        toast.error(
          "You don't have permission to view this event because you're not a member or admin"
        );
      }
    };

    return (
      <Col xs={24} sm={12} lg={8} key={event.id}>
        <Card
          hoverable
          className={`event-card ${isDarkMode ? "dark" : "light"}`}
          onClick={handleCardClick}
          cover={
            event.eventAvatar && (
              <img
                alt={event.name}
                src={event.eventAvatar}
                className="event-image"
              />
            )
          }
        >
          <Card.Meta
            title={event.name}
            description={
              <Space direction="vertical">
                <div className="event-info">
                  <Tag color="blue">{event.category}</Tag>
                  <Tag>
                    <Space>
                      <UserOutlined />
                      {event.activeAttendeesCount}
                    </Space>
                  </Tag>
                </div>
                <Space>
                  <CalendarOutlined />
                  {dayjs(event.eventDate).format("MMM D, YYYY")}
                </Space>
                {event.address && (
                  <Space>
                    <EnvironmentOutlined />
                    {event.address}
                  </Space>
                )}
                <div className="event-creator">
                  <div className="admin-label">Admin</div>
                  <Avatar src={event.creator.avatarUrl} />
                  <span className="creator-name">{event.creator.userName}</span>
                </div>
                {!isCreator && !isAttendee && (
                  <Button
                    type="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      joinEventMutation.mutate(event.id);
                    }}
                    disabled={hasPendingRequest}
                    loading={joiningEventId === event.id}
                    className={`join-button ${
                      hasPendingRequest ? "pending" : ""
                    }`}
                  >
                    {hasPendingRequest
                      ? "Waiting for admin's approval"
                      : "Join Event"}
                  </Button>
                )}
              </Space>
            }
          />
        </Card>
      </Col>
    );
  };

  const tabItems = [
    {
      key: "my-events",
      label: "My Events",
      children: (
        <Row gutter={[16, 16]}>
          {myEvents.data?.data?.events.map(renderEventCard)}
        </Row>
      ),
    },
    {
      key: "discover",
      label: "Discover",
      children: (
        <>
          <Select
            className={`category-select ${isDarkMode ? "dark" : "light"}`}
            style={{ width: 200, marginBottom: 16 }}
            placeholder="Filter by category"
            onChange={handleCategoryChange}
            value={currentCategory}
            allowClear
          >
            {Object.values(EventCategory).map((category) => (
              <Select.Option key={category} value={category}>
                {category}
              </Select.Option>
            ))}
          </Select>

          <Row gutter={[16, 16]}>
            {(currentCategory === "TRENDING"
              ? trendingEvents.data?.data?.events
              : currentCategory !== null
              ? categoryEvents.data?.data?.events
              : discoveryEvents.data?.data?.events
            )?.map(renderEventCard)}
          </Row>
        </>
      ),
    },
  ];

  return (
    <Layout className={`explore-layout ${isDarkMode ? "dark" : "light"}`}>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 16,
        }}
      >
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
          style={{
            borderRadius: 8,
            background: "#000000",
            height: 32,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
          }}
        >
          Create Event
        </Button>
      </div>

      <Tabs
        activeKey={currentTab}
        onChange={handleTabChange}
        items={tabItems}
        className={`event-tabs ${isDarkMode ? "dark" : "light"}`}
      />

      <Modal
        title="Create Event"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
          setFileList([]);
        }}
        footer={null}
        className={`event-form-modal ${isDarkMode ? "dark" : "light"}`}
      >
        <Form
          form={form}
          onFinish={handleCreateEvent}
          layout="vertical"
          onValuesChange={() => {
            // Force re-render to update submit button state
            form
              .validateFields()
              .then(() => {})
              .catch(() => {});
          }}
        >
          <Form.Item
            name="name"
            label="Event Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true }]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            name="eventDate"
            label="Event Date"
            rules={[{ required: true }]}
          >
            <DatePicker showTime />
          </Form.Item>

          <Form.Item name="category" label="Category">
            <Select>
              {Object.values(CreateEventCategory).map((category) => (
                <Select.Option key={category} value={category}>
                  {category}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="address" label="Address">
            <Input />
          </Form.Item>

          <Form.Item label="Event Image">
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
            >
              <Button icon={<UploadOutlined />}>Select Image</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={createEventMutation.isPending}
              disabled={!isFormValid() || createEventMutation.isPending}
              block
            >
              {createEventMutation.isPending
                ? "Creating Event..."
                : "Create Event"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}

export default EventList;
