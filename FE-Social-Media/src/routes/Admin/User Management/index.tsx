import { Table, Space, Button, Tag, message } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import adminApi from "../../../api/admin.api";
import "./index.css";

interface UserData {
  id: string;
  userName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  _count: {
    posts: number;
    followers: number;
    following: number;
  };
  postSentimentRatio: {
    GOOD: number;
    MODERATE: number;
    BAD: number;
  };
  commentSentimentRatio: {
    GOOD: number;
    MODERATE: number;
    BAD: number;
  };
}

interface UserManagementProps {
  isDarkMode: boolean;
}

const UserManagement = ({ isDarkMode }: UserManagementProps) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, pageSize],
    queryFn: () => adminApi.getUserManagementData(page, pageSize),
  });

  const toggleActivityMutation = useMutation({
    mutationFn: (userId: string) => adminApi.toggleUserActivity(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      message.success("User status updated successfully");
    },
  });

  const columns = [
    {
      title: "Username",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <Tag color={role === "ADMIN" ? "gold" : "blue"}>{role}</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Engagement",
      key: "engagement",
      render: (_: any, record: UserData) => (
        <Space direction="vertical" size="small">
          <span>Posts: {record._count.posts}</span>
          <span>Followers: {record._count.followers}</span>
          <span>Following: {record._count.following}</span>
        </Space>
      ),
    },
    {
      title: "Sentiment Analysis",
      key: "sentiment",
      render: (_: any, record: UserData) => (
        <Space direction="vertical" size="small">
          <div>
            Posts:
            <Tag color="green" style={{ marginLeft: 8 }}>
              {record.postSentimentRatio.GOOD.toFixed(1)}%
            </Tag>
            <Tag color="orange">
              {record.postSentimentRatio.MODERATE.toFixed(1)}%
            </Tag>
            <Tag color="red">{record.postSentimentRatio.BAD.toFixed(1)}%</Tag>
          </div>
          <div>
            Comments:
            <Tag color="green" style={{ marginLeft: 8 }}>
              {record.commentSentimentRatio.GOOD.toFixed(1)}%
            </Tag>
            <Tag color="orange">
              {record.commentSentimentRatio.MODERATE.toFixed(1)}%
            </Tag>
            <Tag color="red">
              {record.commentSentimentRatio.BAD.toFixed(1)}%
            </Tag>
          </div>
        </Space>
      ),
    },
    {
      title: "Joined",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Last Login",
      dataIndex: "lastLoginAt",
      key: "lastLoginAt",
      render: (date: string | null) =>
        date ? new Date(date).toLocaleDateString() : "N/A",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: UserData) => (
        <Space>
          <Button
            onClick={() => toggleActivityMutation.mutate(record.id)}
            loading={toggleActivityMutation.isPending}
          >
            {record.isActive ? "Deactivate" : "Activate"}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Table
        columns={columns}
        dataSource={data?.users}
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
        scroll={{ x: 1500 }}
        className={isDarkMode ? "dark-table" : ""}
        style={{
          background: isDarkMode ? "#1f1f1f" : "#ffffff",
        }}
      />
    </div>
  );
};

export default UserManagement;
