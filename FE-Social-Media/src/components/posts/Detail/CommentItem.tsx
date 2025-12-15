import { Comment } from "@ant-design/compatible";
import { Avatar, Image, Space, Tooltip, Typography } from "antd";
import { formatDistance } from "date-fns";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import { useNavigate } from "react-router-dom";
import "./CommentItem.css";

interface CommentItemProps {
  comment: {
    id: string;
    content: string;
    createdAt: Date | string;
    userId: string;
    sentiment: string;
    user: {
      id: string;
      userName: string;
      avatarUrl?: string;
    };
    attachments: {
      id: string;
      commentId: string | null;
      postId: string | null;
      type: "image" | "video";
      url: string;
      createdAt: string;
    }[];
  };
  isDarkMode: boolean;
}

const getSentimentMessage = (sentiment: string) => {
  switch (sentiment) {
    case "GOOD":
      return "This comment has a positive sentiment based on its content";
    case "MODERATE":
      return "This comment has a neutral sentiment based on its content";
    case "BAD":
      return "This comment has a negative sentiment based on its content";
    default:
      return "Sentiment analysis not available";
  }
};

const CommentItem = ({ comment, isDarkMode }: CommentItemProps) => {
  const navigate = useNavigate();

  const handleNavigateToProfile = (userId: string) => {
    navigate(`/profile?userId=${userId}`);
  };

  return (
    <Comment
      author={
        <Typography.Text style={{ color: isDarkMode ? "#e4e6eb" : "inherit" }}>
          {comment.user.userName}
        </Typography.Text>
      }
      avatar={
        <Avatar
          src={comment.user.avatarUrl}
          alt={comment.user.userName}
          style={{ cursor: "pointer" }}
          onClick={() => handleNavigateToProfile(comment.userId)}
        />
      }
      content={
        <div
          style={{
            backgroundColor: isDarkMode ? "#3a3b3c" : "#f0f2f5",
            padding: "8px 12px",
            borderRadius: "16px",
            maxWidth: "fit-content",
          }}
        >
          <Typography.Paragraph
            style={{
              color: isDarkMode ? "#e4e6eb" : "inherit",
              margin: 0,
            }}
          >
            {comment.content}
          </Typography.Paragraph>
          {comment.attachments && comment.attachments.length > 0 && (
            <Space wrap style={{ marginTop: "8px" }}>
              {comment.attachments.map((attachment) => (
                <div key={attachment.id}>
                  {attachment.type === "video" ? (
                    <div style={{ width: "200px" }}>
                      <Plyr
                        source={{
                          type: "video",
                          sources: [{ src: attachment.url, type: "video/mp4" }],
                        }}
                        options={{
                          controls: [
                            "play",
                            "progress",
                            "current-time",
                            "mute",
                            "volume",
                          ],
                        }}
                      />
                    </div>
                  ) : (
                    <Image
                      src={attachment.url}
                      alt="Comment attachment"
                      style={{
                        maxWidth: "200px",
                        maxHeight: "200px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                      preview={{
                        mask: null,
                        maskClassName: "custom-mask",
                      }}
                    />
                  )}
                </div>
              ))}
            </Space>
          )}
        </div>
      }
      datetime={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Typography.Text
            type="secondary"
            style={{ color: isDarkMode ? "#b0b3b8" : "inherit" }}
          >
            {formatDistance(new Date(comment.createdAt), new Date(), {
              addSuffix: true,
            })}
          </Typography.Text>
          <Tooltip title={getSentimentMessage(comment.sentiment)}>
            <div
              className={`sentiment-indicator sentiment-${comment.sentiment.toLowerCase()}`}
              aria-label={`Sentiment: ${comment.sentiment}`}
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                cursor: "help",
                backgroundColor:
                  comment.sentiment === "GOOD"
                    ? "#52c41a"
                    : comment.sentiment === "BAD"
                    ? "#ff4d4f"
                    : "#faad14",
              }}
            />
          </Tooltip>
        </div>
      }
    />
  );
};

export default CommentItem;
