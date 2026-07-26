import {
  ArrowLeftOutlined,
  ShareAltOutlined,
  CheckOutlined,
  UserOutlined,
  UploadOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Empty,
  Layout,
  List,
  Modal,
  Skeleton,
  Space,
  Typography,
  message,
  Input,
  Upload,
  Popconfirm,
  Image,
  Tooltip,
} from "antd";
import {
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { groupApi, GroupPost } from "../../../../api/group";
import "./index.css";
import { useState } from "react";
import { useAppStore } from "../../../../store";
import type { UploadFile } from "antd/es/upload/interface";

const { Title, Text } = Typography;

interface GroupDetailProps {
  isDarkMode: boolean;
}

function GroupDetail({ isDarkMode }: GroupDetailProps) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { userInfo } = useAppStore();

  const [isCopied, setIsCopied] = useState(false);
  const [isJoinRequestsModalOpen, setIsJoinRequestsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const groupName = location.state?.groupName || searchParams.get("groupName");
  const groupId = searchParams.get("groupId");

  const { data: groupPosts } = useQuery({
    queryKey: ["groupPosts", groupId],
    queryFn: () => groupApi.getGroupPosts(groupId!),
    enabled: !!groupId,
  });

  const { data: group, isLoading } = useQuery({
    queryKey: ["group", groupId],
    queryFn: () => groupApi.getGroupById(groupId!),
    enabled: !!groupId,
  });

  const { data: joinRequests = [] } = useQuery({
    queryKey: ["joinRequests", groupId],
    queryFn: () => groupApi.getJoinRequests(groupId!),
    enabled: !!groupId && isJoinRequestsModalOpen,
  });

  const approveMutation = useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      groupApi.approveJoinRequest(groupId!, userId),
    onSuccess: () => {
      setIsJoinRequestsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["joinRequests", groupId] });
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });

      queryClient.invalidateQueries({ queryKey: ["groups", "joined"] });
      queryClient.invalidateQueries({ queryKey: ["groups", "exploring"] });
      message.success("Request approved successfully");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ userId }: { userId?: string }) =>
      groupApi.rejectJoinRequest(groupId!, userId),
    onSuccess: () => {
      navigate("/groups");
      setIsJoinRequestsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["joinRequests", groupId] });
    },
  });

  const handleApprove = (userId: string) => {
    approveMutation.mutate({ userId });
  };

  const handleReject = (userId?: string) => {
    rejectMutation.mutate({ userId });
  };

  const isAdmin = userInfo?.userId === group?.creatorId;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      message.success("Group link copied to clipboard!");

      // Reset the button after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      message.error("Failed to copy link");
    }
  };

  const [postContent, setPostContent] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createPostMutation = useMutation({
    mutationFn: async ({
      content,
      files,
    }: {
      content: string;
      files: File[];
    }) => {
      return groupApi.createGroupPost(groupId!, {
        content,
        files,
      });
    },
    onSuccess: () => {
      setPostContent("");
      setFileList([]);
      queryClient.invalidateQueries({ queryKey: ["groupPosts", groupId] });
      message.success("Post created successfully");
    },
    onError: () => {
      message.error("Failed to create post");
    },
  });

  const handleCreatePost = async () => {
    if (!postContent.trim()) {
      message.warning("Please enter some content");
      return;
    }

    setIsSubmitting(true);
    try {
      const files = fileList
        .filter((file) => file.originFileObj)
        .map((file) => file.originFileObj!) as File[];

      await createPostMutation.mutateAsync({
        content: postContent,
        files,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const createPostSection = (
    <div
      style={{
        padding: "20px",
        borderBottom: `1px solid ${isDarkMode ? "#303030" : "#f0f0f0"}`,
      }}
    >
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
        <Avatar src={userInfo?.avatarUrl} size={40} />
        <Input.TextArea
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          placeholder={`What's on your mind, ${userInfo?.userName}?`}
          autoSize={{ minRows: 2, maxRows: 6 }}
          style={{
            background: isDarkMode ? "#1f1f1f" : "#ffffff",
            color: isDarkMode ? "#ffffff" : "#000000",
            flex: 1,
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Upload
          fileList={fileList}
          onChange={({ fileList }) => setFileList(fileList)}
          multiple
          maxCount={5}
          beforeUpload={() => false}
        >
          <Button
            icon={<UploadOutlined />}
            style={{
              background: isDarkMode ? "#1f1f1f" : "#ffffff",
              borderColor: isDarkMode ? "#303030" : "#d9d9d9",
              color: isDarkMode ? "#ffffff" : "#000000",
            }}
          >
            Attach Files
          </Button>
        </Upload>
        <Button
          type="primary"
          onClick={handleCreatePost}
          loading={isSubmitting}
          style={{
            background: "#1677ff",
          }}
        >
          Post
        </Button>
      </div>
    </div>
  );

  const deleteGroupPostMutation = useMutation({
    mutationFn: ({ groupId, postId }: { groupId: string; postId: string }) =>
      groupApi.deleteGroupPost(groupId, postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupPosts", groupId] });
      message.success("Post deleted successfully");
    },
    onError: () => {
      message.error("Failed to delete post");
    },
  });

  const updateGroupPostMutation = useMutation({
    mutationFn: ({
      groupId,
      postId,
      content,
    }: {
      groupId: string;
      postId: string;
      content: string;
    }) =>
      groupApi.updateGroupPost(groupId, postId, {
        content,
        attachments: editingPost?.attachments,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groupPosts", groupId] });
      message.success("Post updated successfully");
      setEditingPost(null);
    },
    onError: () => {
      message.error("Failed to update post");
    },
  });

  const [editingPost, setEditingPost] = useState<GroupPost | null>(null);
  const [editContent, setEditContent] = useState("");

  const handleEditPost = (post: GroupPost) => {
    setEditingPost(post);
    setEditContent(post.content);
  };

  const getSentimentMessage = (sentiment: string) => {
    switch (sentiment) {
      case "GOOD":
        return "This post has a positive sentiment based on its content";
      case "MODERATE":
        return "This post has a neutral sentiment based on its content";
      case "BAD":
        return "This post has a negative sentiment based on its content";
      default:
        return "Sentiment analysis not available";
    }
  };

  if (!groupId) {
    return <Navigate to="/groups" replace />;
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
        <div className="group-detail-container">
          <div className="group-cover-container">
            <Skeleton.Image
              active
              style={{
                height: "350px",
                borderRadius: 0,
              }}
            />
          </div>

          <div
            className="group-info-section"
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

          <div style={{ padding: "24px" }}>
            <Skeleton.Button
              active
              style={{ marginBottom: "16px", width: 120 }}
            />
            <Skeleton active paragraph={{ rows: 3 }} />
          </div>
        </div>
      </Layout>
    );
  }

  const joinRequestsModal = (
    <Modal
      title="Join Requests"
      open={isJoinRequestsModalOpen}
      onCancel={() => setIsJoinRequestsModalOpen(false)}
      footer={null}
      style={{ top: 20 }}
    >
      <List
        itemLayout="horizontal"
        dataSource={joinRequests}
        locale={{
          emptyText: (
            <Empty
              description={
                <span style={{ color: isDarkMode ? "#ffffff" : undefined }}>
                  No pending requests
                </span>
              }
            />
          ),
        }}
        renderItem={(request) => (
          <List.Item
            key={request.id}
            actions={[
              <Button
                key="approve"
                type="primary"
                onClick={() => handleApprove(request.userId)}
                loading={approveMutation.isPending}
              >
                Approve
              </Button>,
              <Button
                key="reject"
                danger
                onClick={() => {
                  message.success("Reject request successfully");
                  handleReject(request.userId);
                }}
                loading={rejectMutation.isPending}
              >
                Reject
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar src={request.user.avatarUrl} />}
              title={request.user.userName}
              // description={`Requested on ${new Date(
              //   request.createdAt
              // ).toLocaleDateString()}`}
            />
          </List.Item>
        )}
      />
    </Modal>
  );

  return (
    <Layout
      style={{
        background: isDarkMode ? "#141414" : "#ffffff",
      }}
    >
      <div className="group-detail-container">
        <div className="group-cover-container">
          <img
            className="group-cover-image"
            src={group?.groupAvatar || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"}
            alt={groupName}
          />
        </div>

        <div
          className="group-info-section"
          style={{
            borderBottom: `1px solid ${isDarkMode ? "#303030" : "#f0f0f0"}`,
          }}
        >
          <div className="group-info-container">
            <Button
              className="back-button"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/groups?groupType=joined")}
              shape="circle"
              style={{
                background: isDarkMode ? "#1f1f1f" : "#f0f0f0",
                borderColor: isDarkMode ? "#303030" : "#d9d9d9",
                color: isDarkMode ? "#ffffff" : "#000000",
              }}
            />
            <div className="group-info-content">
              <Title
                level={2}
                className="group-title"
                style={{ color: isDarkMode ? "#ffffff" : "#000000" }}
              >
                {groupName}
              </Title>
              <Space size={4} className="member-info">
                <Text
                  type="secondary"
                  style={{
                    color: isDarkMode ? "#ffffff" : undefined,
                  }}
                >
                  {group?._count?.members.toLocaleString()} members
                </Text>
                <Text type="secondary">•</Text>
                <div className="member-avatars">
                  {group?.members?.slice(0, 5).map((member: any) => (
                    <Avatar
                      key={member.user.id}
                      src={member.user.avatarUrl}
                      className="member-avatar"
                      style={{
                        border: `2px solid ${
                          isDarkMode ? "#141414" : "#ffffff"
                        }`,
                      }}
                    />
                  ))}
                </div>
              </Space>
            </div>
          </div>

          <Space>
            <Button
              icon={isCopied ? <CheckOutlined /> : <ShareAltOutlined />}
              onClick={handleShare}
              style={{
                background: isDarkMode ? "#141414" : "#ffffff",
                borderColor: isDarkMode ? "#303030" : "#d9d9d9",
                color: isDarkMode ? "#ffffff" : "#000000",
              }}
            >
              {isCopied ? "Copied" : "Share"}
            </Button>
            {isAdmin && (
              <Button
                icon={<UserOutlined />}
                onClick={() => setIsJoinRequestsModalOpen(true)}
                style={{
                  background: isDarkMode ? "#141414" : "#ffffff",
                  borderColor: isDarkMode ? "#303030" : "#d9d9d9",
                  color: isDarkMode ? "#ffffff" : "#000000",
                }}
              >
                View Join Requests
              </Button>
            )}
            {!isAdmin && (
              <Button
                type="primary"
                style={{
                  background: "#000000",
                  borderColor: "#000000",
                }}
                onClick={() => {
                  message.success("Leave group successfully");
                  handleReject();
                }}
              >
                Leave
              </Button>
            )}
          </Space>
        </div>

        {group?.members?.some(
          (member) =>
            member.userId === userInfo?.userId &&
            (member.role === "MEMBER" || member.role === "ADMIN")
        ) && createPostSection}

        <div className="posts-container">
          <List
            itemLayout="vertical"
            dataSource={groupPosts}
            locale={{
              emptyText: (
                <Empty
                  description={
                    <span style={{ color: isDarkMode ? "#ffffff" : undefined }}>
                      No posts yet
                    </span>
                  }
                />
              ),
            }}
            renderItem={(post: GroupPost) => (
              <List.Item
                key={post.id}
                style={{
                  padding: "16px",
                  border: `1px solid ${isDarkMode ? "#303030" : "#f0f0f0"}`,
                  borderRadius: "8px",
                  marginBottom: "16px",
                }}
              >
                <div style={{ width: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <Space>
                      <Avatar src={post.user.avatarUrl} />
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Text
                            strong
                            style={{
                              color: isDarkMode ? "#ffffff" : undefined,
                            }}
                          >
                            {post.user.userName}
                          </Text>
                          <Tooltip title={getSentimentMessage(post.sentiment)}>
                            <div
                              className={`sentiment-indicator sentiment-${post.sentiment.toLowerCase()}`}
                              aria-label={`Sentiment: ${post.sentiment}`}
                              style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                cursor: "help",
                                backgroundColor:
                                  post.sentiment === "GOOD"
                                    ? "#52c41a"
                                    : post.sentiment === "BAD"
                                    ? "#ff4d4f"
                                    : "#faad14",
                              }}
                            />
                          </Tooltip>
                        </div>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </Text>
                      </div>
                    </Space>
                    {post.userId === userInfo?.userId && (
                      <Space>
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => handleEditPost(post)}
                          style={{
                            color: isDarkMode ? "#b0b3b8" : undefined,
                          }}
                        />
                        <Popconfirm
                          title="Delete post"
                          description="Are you sure you want to delete this post?"
                          onConfirm={() =>
                            deleteGroupPostMutation.mutate({
                              groupId: groupId!,
                              postId: post.id,
                            })
                          }
                          okText="Yes"
                          cancelText="No"
                          okButtonProps={{
                            danger: true,
                          }}
                        >
                          <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            style={{
                              color: isDarkMode ? "#b0b3b8" : undefined,
                            }}
                          />
                        </Popconfirm>
                      </Space>
                    )}
                  </div>

                  {editingPost?.id === post.id ? (
                    <div style={{ marginTop: "8px" }}>
                      <Input.TextArea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        autoSize={{ minRows: 2, maxRows: 6 }}
                        style={{
                          marginBottom: "8px",
                          background: isDarkMode ? "#1f1f1f" : "#ffffff",
                          color: isDarkMode ? "#ffffff" : "#000000",
                        }}
                      />
                      <Space>
                        <Button
                          type="primary"
                          onClick={() => {
                            updateGroupPostMutation.mutate({
                              groupId: groupId!,
                              postId: post.id,
                              content: editContent,
                            });
                          }}
                          loading={updateGroupPostMutation.isPending}
                        >
                          Save
                        </Button>
                        <Button onClick={() => setEditingPost(null)}>
                          Cancel
                        </Button>
                      </Space>
                    </div>
                  ) : (
                    <Typography.Paragraph
                      style={{
                        margin: "12px 0",
                        color: isDarkMode ? "#ffffff" : undefined,
                      }}
                    >
                      {post.content}
                    </Typography.Paragraph>
                  )}

                  {post.attachments && post.attachments.length > 0 && (
                    <div style={{ marginTop: "12px" }}>
                      {post.attachments.map((attachment) => (
                        <Image
                          key={attachment.id}
                          src={attachment.url}
                          alt="post attachment"
                          style={{
                            maxWidth: "100%",
                            borderRadius: "8px",
                            marginTop: "8px",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </List.Item>
            )}
          />
        </div>
      </div>
      {joinRequestsModal}
    </Layout>
  );
}

export default GroupDetail;
