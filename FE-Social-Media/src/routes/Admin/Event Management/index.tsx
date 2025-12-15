import {
  Table,
  Space,
  Button,
  Tag,
  Modal,
  message,
  Avatar,
  List,
  Tabs,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import adminApi from "../../../api/admin.api";
import "./index.css";
import { eventApi } from "../../../api/event";
import type { EventDetail } from "../../../api/event";

interface EventManagementProp {
  isDarkMode: boolean;
}

interface EventRecord {
  id: string;
  name: string;
  description: string;
  eventAvatar: string | null;
  eventDate: string;
  category: string;
  address: string | null;
  createdAt: string;
  creator: {
    userName: string;
  };
  _count: {
    attendees: number;
  };
}

function EventManagement({ isDarkMode }: EventManagementProp) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState<EventDetail | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [joinRequestsVisible, setJoinRequestsVisible] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-events", page, pageSize],
    queryFn: () => adminApi.getEventManagementData(page, pageSize),
  });

  const { data: eventDetailQuery } = useQuery({
    queryKey: ["event-detail", selectedEvent?.id],
    select: (data) => data?.data,
    queryFn: () =>
      selectedEvent?.id ? eventApi.getEventById(selectedEvent.id) : null,
    enabled: !!selectedEvent?.id,
  });

  const { data: joinRequestsQuery } = useQuery({
    queryKey: ["event-join-requests", selectedEvent?.id],
    select: (data) => data?.data,
    queryFn: () =>
      selectedEvent?.id ? eventApi.getJoinRequests(selectedEvent.id) : null,
    enabled: !!selectedEvent?.id && joinRequestsVisible,
  });

  const deleteEventMutation = useMutation({
    mutationFn: (eventId: string) => adminApi.deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      message.success("Event deleted successfully");
    },
  });

  const approveRequestMutation = useMutation({
    mutationFn: ({ eventId, userId }: { eventId: string; userId: string }) =>
      eventApi.approveRequest(eventId, userId),
    onSuccess: () => {
      setJoinRequestsVisible(false);
      queryClient.invalidateQueries({ queryKey: ["event-detail"] });
      queryClient.invalidateQueries({ queryKey: ["event-join-requests"] });
      message.success("Request approved successfully");
    },
  });

  const cancelAttendanceMutation = useMutation({
    mutationFn: ({ eventId, userId }: { eventId: string; userId: string }) =>
      eventApi.cancelAttendance(eventId, userId),
    onSuccess: () => {
      setJoinRequestsVisible(false);
      queryClient.invalidateQueries({ queryKey: ["event-detail"] });
      queryClient.invalidateQueries({ queryKey: ["event-join-requests"] });
      message.success("Request rejected successfully");
    },
  });

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category: string) => (
        <Tag color="blue">{category.replace("_", " ")}</Tag>
      ),
    },
    {
      title: "Creator",
      dataIndex: ["creator", "userName"],
      key: "creator",
    },
    {
      title: "Event Details",
      key: "details",
      render: (_: unknown, record: EventRecord) => (
        <Space direction="vertical" size="small">
          <span>Date: {new Date(record.eventDate).toLocaleDateString()}</span>
          <span>Attendees: {record._count.attendees}</span>
          <span>
            Address: {record.address ? record.address : "No location specified"}
          </span>
        </Space>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: EventRecord) => (
        <Space>
          <Button
            onClick={() => {
              setSelectedEvent(record as unknown as EventDetail);
              setDetailModalVisible(true);
            }}
          >
            View All Attendees
          </Button>
          <Button
            onClick={() => {
              setSelectedEvent(record as unknown as EventDetail);
              setJoinRequestsVisible(true);
            }}
          >
            View Join Requests
          </Button>
          <Button
            danger
            onClick={() => {
              Modal.confirm({
                title: "Are you sure you want to delete this event?",
                content: "This action cannot be undone.",
                okText: "Yes",
                cancelText: "No",
                onOk: () => deleteEventMutation.mutate(record.id),
              });
            }}
            loading={deleteEventMutation.isPending}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const renderDetailModal = () => (
    <Modal
      title={`Event Details: ${selectedEvent?.name}`}
      open={detailModalVisible}
      onCancel={() => setDetailModalVisible(false)}
      footer={null}
      width={800}
    >
      <Tabs
        items={[
          {
            key: "attendees",
            label: "Attendees",
            children: (
              <List
                dataSource={eventDetailQuery?.attendees || []}
                renderItem={(attendee) => (
                  <List.Item
                    actions={[
                      attendee.status === "PENDING" && (
                        <Button
                          type="primary"
                          onClick={() =>
                            approveRequestMutation.mutate({
                              eventId: selectedEvent!.id,
                              userId: attendee.id,
                            })
                          }
                          loading={approveRequestMutation.isPending}
                        >
                          Approve
                        </Button>
                      ),
                      <Button
                        danger
                        onClick={() =>
                          cancelAttendanceMutation.mutate({
                            eventId: selectedEvent!.id,
                            userId: attendee.id,
                          })
                        }
                        loading={cancelAttendanceMutation.isPending}
                      >
                        Remove
                      </Button>,
                    ].filter(Boolean)}
                  >
                    <List.Item.Meta
                      avatar={<Avatar src={attendee.avatarUrl} />}
                      title={attendee.userName}
                      description={`Role: ${attendee.role}, Status: ${attendee.status}`}
                    />
                  </List.Item>
                )}
              />
            ),
          },
        ]}
      />
    </Modal>
  );

  const renderJoinRequestsModal = () => (
    <Modal
      title={`Join Requests: ${selectedEvent?.name}`}
      open={joinRequestsVisible}
      onCancel={() => setJoinRequestsVisible(false)}
      footer={null}
      width={800}
    >
      <List
        dataSource={joinRequestsQuery?.requests || []}
        renderItem={(request) => (
          <List.Item
            actions={[
              <Button
                type="primary"
                onClick={() =>
                  approveRequestMutation.mutate({
                    eventId: selectedEvent!.id,
                    userId: request.userId,
                  })
                }
                loading={approveRequestMutation.isPending}
              >
                Approve
              </Button>,
              <Button
                danger
                onClick={() =>
                  cancelAttendanceMutation.mutate({
                    eventId: selectedEvent!.id,
                    userId: request.userId,
                  })
                }
                loading={cancelAttendanceMutation.isPending}
              >
                Reject
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar src={request.user.avatarUrl} />}
              title={request.user.userName}
              description={`Requested at: ${new Date(
                request.createAt
              ).toLocaleString()}`}
            />
          </List.Item>
        )}
        locale={{
          emptyText: "No pending join requests",
        }}
      />
    </Modal>
  );

  return (
    <div style={{ padding: "24px" }}>
      <Table
        columns={columns}
        dataSource={data?.events}
        loading={isLoading}
        pagination={{
          total: data?.total,
          current: page,
          pageSize: pageSize,
          onChange: (page, pageSize) => {
            setPage(page);
            setPageSize(pageSize);
          },
        }}
        rowKey="id"
        scroll={{ x: 1200 }}
        className={isDarkMode ? "dark-table" : ""}
        style={{
          background: isDarkMode ? "#1f1f1f" : "#ffffff",
        }}
      />
      {renderDetailModal()}
      {renderJoinRequestsModal()}
    </div>
  );
}

export default EventManagement;
