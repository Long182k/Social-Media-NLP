import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Upload as AntUpload,
  Avatar,
  Button,
  Card,
  Dropdown,
  Image,
  Input,
  Space,
  Tooltip,
  Typography,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import {
  Bookmark,
  Edit3,
  Ellipsis,
  MessageCircle,
  ThumbsUp,
  Trash2,
  Upload,
} from "lucide-react";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { formatTimeAgo, isVideoUrl } from "../../../@util/helpers";
import { CreateCommentDto, Post } from "../../../@util/types/post.type";
import { postApi } from "../../../api/post";
import { useNotifications } from "../../../hooks/useNotifications";
import { useAppStore } from "../../../store";
import { renderContent } from "../../generalRender/renderContent";
import CommentItem from "./CommentItem";
import "./PostItem.css";
import { usePosts } from "../../../hooks/usePosts";

interface PostItemProps {
  post: Post;
  currentUserId: string;
  isDarkMode: boolean;
  isLoadingPosts: boolean;
  refetchPosts: () => void;
  onEdit: (post: Post) => void;
  onDelete?: (postId: string) => Promise<void>;
}

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

const PostItem = ({
  post,
  currentUserId,
  isDarkMode,
  isLoadingPosts,
  onEdit,
  refetchPosts,
}: PostItemProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const { userInfo } = useAppStore();

  const { toggleBookmarkNotification } = useNotifications();
  const { likePost } = usePosts();

  const isOwner = post.userId === currentUserId;

  const deletePostMutation = useMutation({
    mutationFn: postApi.deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete post");
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateCommentDto }) => {
      const formData = new FormData();
      formData.append("content", data.content);

      if (data.files) {
        data.files.forEach((file) => {
          formData.append("files", file);
        });
      }

      return postApi.commentPost(id, formData);
    },
    onSuccess: () => {
      refetchPosts();
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setCommentText("");
      setFileList([]);
      toast.success("Comment posted successfully!");
    },
    onError: () => {
      toast.error("Failed to post comment");
    },
  });

  const handleCreateCmt = (
    id: string,
    content: string,
    files?: File[]
  ): void => {
    createCommentMutation.mutate({
      id,
      data: { content, files },
    });
  };

  const handleLikePost = (postId: string): void => {
    likePost(postId);
    setIsLiked(!isLiked);
  };

  const handleBookmarkPost = (): void => {
    toggleBookmarkNotification(post.id);
    setIsBookmarked(!isBookmarked);
  };

  const handleDeletePost = (postId: string): void => {
    deletePostMutation.mutate(postId);
  };

  const handleNavigateToProfile = (userId: string) => {
    navigate(`/profile?userId=${userId}`);
  };

  const handleFileChange = ({
    fileList: newFileList,
  }: {
    fileList: UploadFile[];
  }) => {
    setFileList(newFileList);
  };

  return (
    <Card
      className={`post-item ${isDarkMode ? "dark" : "light"}`}
      style={{
        backgroundColor: isDarkMode ? "#242526" : "#ffffff",
        border: isDarkMode ? "1px solid #3e4042" : "1px solid #e4e6eb",
        marginBottom: "16px",
        marginLeft: "16px",
        marginRight: "16px",
        borderRadius: "8px",
      }}
    >
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        {/* Post Header */}
        <Space
          className="post-header"
          style={{ width: "100%", justifyContent: "space-between" }}
        >
          <Space>
            <Avatar
              src={post.user.avatarUrl}
              size={50}
              style={{ cursor: "pointer" }}
              onClick={() => handleNavigateToProfile(post.userId)}
            />
            <div>
              <Typography.Text
                strong
                style={{ color: isDarkMode ? "#e4e6eb" : "inherit" }}
              >
                {post.user.userName}
              </Typography.Text>
              <div className="post-header-right">
                <Typography.Text
                  type="secondary"
                  style={{
                    color: isDarkMode ? "#b0b3b8" : "rgb(0,0,0,0.45)",
                    marginLeft: "8px",
                  }}
                >
                  {formatTimeAgo(new Date(post.createdAt))}
                </Typography.Text>
                <Tooltip title={getSentimentMessage(post.sentiment)}>
                  <div
                    className={`sentiment-indicator sentiment-${post.sentiment.toLowerCase()}`}
                    aria-label={`Sentiment: ${post.sentiment}`}
                  />
                </Tooltip>
              </div>
            </div>
          </Space>

          {/* Action buttons */}
          <Space className={`post-actions ${isDarkMode ? "dark" : ""}`}>
            {isOwner && (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "edit",
                      label: "Edit",
                      icon: <Edit3 size={16} />,
                      onClick: () => onEdit?.(post),
                    },
                    {
                      key: "delete",
                      label: "Delete",
                      icon: <Trash2 size={16} />,
                      danger: true,
                      onClick: () => handleDeletePost?.(post.id),
                    },
                  ],
                }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  icon={<Ellipsis size={20} />}
                  className="more-actions-btn"
                />
              </Dropdown>
            )}
          </Space>
        </Space>

        {/* Post Content */}
        <Typography.Paragraph
          style={{
            margin: 0,
            color: isDarkMode ? "#e4e6eb" : "inherit",
          }}
        >
          {renderContent(post?.content, isDarkMode)}
        </Typography.Paragraph>

        {post.attachments &&
          post.attachments.map((attachment) => (
            <div key={attachment.id}>
              {isVideoUrl(attachment.url) ? (
                <Plyr
                  source={{
                    type: "video",
                    sources: [
                      {
                        src: attachment.url,
                        type: "video/mp4",
                      },
                    ],
                  }}
                  options={{
                    controls: [
                      "play",
                      "progress",
                      "current-time",
                      "mute",
                      "volume",
                      "fullscreen",
                    ],
                    ratio: "16:9",
                  }}
                />
              ) : (
                <Image
                  src={attachment.url}
                  style={{ maxHeight: "400px", objectFit: "contain" }}
                />
              )}
            </div>
          ))}

        {/* Action Buttons */}
        <div
          className="post-actions"
          style={{
            borderTop: `1px solid ${isDarkMode ? "#3e4042" : "#e4e6eb"}`,
            marginTop: "8px",
            paddingTop: "8px",
          }}
        >
          <Space
            size={8}
            style={{
              width: "100%",
              justifyContent: "space-between",
              color: "#F0F0F0",
            }}
          >
            <Button
              type="text"
              icon={
                <ThumbsUp
                  size={20}
                  fill={isLiked ? "#1677ff" : "none"}
                  style={{
                    color: isLiked ? "#1677ff" : "#878686",
                    transition: "all 0.3s ease",
                  }}
                />
              }
              className={`action-button ${isDarkMode ? "dark" : ""}`}
              onClick={() => handleLikePost?.(post.id)}
              loading={isLoadingPosts}
            >
              <span style={{ color: isLiked ? "#1677ff" : "#878686" }}>
                {post._count.likes}
              </span>
              <span style={{ color: isLiked ? "#1677ff" : "#878686" }}>
                {" "}
                Like{" "}
              </span>
            </Button>
            <Button
              type="text"
              icon={
                <MessageCircle
                  size={20}
                  style={{
                    color: "#878686",
                    transition: "all 0.3s ease",
                  }}
                />
              }
              className={`action-button ${isDarkMode ? "dark" : ""}`}
              onClick={() => setCommentModalVisible(!commentModalVisible)}
            >
              <span style={{ color: "#878686" }}>{post._count.comments}</span>
              <span style={{ color: "#878686" }}> Comment </span>
            </Button>
            <Button
              type="text"
              icon={
                <Bookmark
                  size={20}
                  fill={isBookmarked ? "#1677ff" : "none"}
                  style={{
                    color: isBookmarked ? "#1677ff" : "#878686",
                    transition: "all 0.3s ease",
                  }}
                />
              }
              className={`action-button ${isDarkMode ? "dark" : ""}`}
              onClick={() => handleBookmarkPost()}
              loading={isLoadingPosts}
            >
              <span style={{ color: isBookmarked ? "#1677ff" : "#878686" }}>
                {post._count.bookmarks}
              </span>
              <span style={{ color: isBookmarked ? "#1677ff" : "#878686" }}>
                {" "}
                Bookmark{" "}
              </span>
            </Button>
          </Space>
        </div>

        {/* Comments Section */}
        {commentModalVisible && (
          <div
            style={{
              borderTop: `1px solid ${isDarkMode ? "#3e4042" : "#e4e6eb"}`,
              paddingTop: 16,
            }}
          >
            {/* Quick Comment Input */}
            <Space direction="vertical" style={{ width: "100%" }}>
              <Space style={{ width: "100%", marginBottom: 8 }}>
                <Avatar src={userInfo.avatarUrl} alt={userInfo.userName} />
                <div style={{ position: "relative", width: "100%" }}>
                  <Input.TextArea
                    placeholder={
                      createCommentMutation.isPending
                        ? "Posting comment..."
                        : "Write a comment..."
                    }
                    autoSize={{ minRows: 1, maxRows: 2 }}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onPressEnter={(e) => {
                      if (!e.shiftKey) {
                        e.preventDefault();
                        if (commentText.trim()) {
                          const files = fileList
                            .map((file) => file.originFileObj)
                            .filter((file): file is File => file !== undefined);
                          handleCreateCmt(post.id, commentText, files);
                          setFileList([]);
                        }
                      }
                    }}
                    style={{
                      backgroundColor: isDarkMode ? "#3a3b3c" : "#f0f2f5",
                      borderRadius: "20px",
                      padding: "8px 12px",
                      paddingRight: "40px", // Make room for the upload icon
                      border: "none",
                      color: isDarkMode ? "#e4e6eb" : "inherit",
                      width: "100%",
                    }}
                    disabled={createCommentMutation.isPending}
                  />
                  <AntUpload
                    fileList={fileList}
                    onChange={handleFileChange}
                    multiple
                    maxCount={5}
                    showUploadList={{
                      showPreviewIcon: true,
                      showRemoveIcon: true,
                    }}
                    beforeUpload={() => false}
                    accept="image/*,video/*"
                  >
                    <Upload
                      size={20}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: isDarkMode ? "#b0b3b8" : undefined,
                        cursor: "pointer",
                      }}
                    />
                  </AntUpload>
                </div>
              </Space>
            </Space>

            {/* Comments List */}
            {post.comments && post.comments.length > 0 && (
              <div
                style={{
                  maxHeight: "300px",
                  overflowY: "auto",
                  padding: "0 16px",
                }}
                className="custom-scrollbar"
              >
                {post.comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    isDarkMode={isDarkMode}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </Space>
    </Card>
  );
};

export default PostItem;
