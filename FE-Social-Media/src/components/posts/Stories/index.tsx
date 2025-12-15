import { PlusOutlined } from "@ant-design/icons";
import { Avatar, Space, Typography } from "antd";
import "./index.css";

const mockStories = [
  {
    id: "1",
    userName: "Esther Howard",
    avatarUrl: "https://example.com/avatar1.jpg",
  },
  {
    id: "2",
    userName: "Arlene McCoy",
    avatarUrl: "https://example.com/avatar2.jpg",
  },
  {
    id: "3",
    userName: "Robert Fox",
    avatarUrl: "https://example.com/avatar3.jpg",
  },
  {
    id: "4",
    userName: "Albert Flores",
    avatarUrl: "https://example.com/avatar4.jpg",
  },
  {
    id: "5",
    userName: "Annette Black",
    avatarUrl: "https://example.com/avatar5.jpg",
  },
];

type StoryListProps = {
  // id: string;
  // userName: string;
  // avatarUrl: string;
  isDarkMode: boolean;
};

const StoryList = ({ isDarkMode }: StoryListProps) => {
  return (
    <div className={`story-container ${isDarkMode ? "dark" : "light"}`}>
      <Space size={8} className="story-list">
        {/* Add Story Button */}
        <div
          className="story-item add-story"
          style={{
            backgroundColor: isDarkMode ? "#242526" : "#ffffff",
            border: isDarkMode ? "1px solid #3e4042" : "1px solid #e4e6eb",
          }}
        >
          <div className="add-story-button">
            <PlusOutlined
              style={{
                fontSize: "24px",
                color: isDarkMode ? "#e4e6eb" : "#1b1b1b",
              }}
            />
          </div>
          <Typography.Text
            style={{ color: isDarkMode ? "#e4e6eb" : "inherit" }}
          >
            Add Story
          </Typography.Text>
        </div>

        {/* Story Items */}
        {mockStories.map((story) => (
          <div
            key={story.id}
            className="story-item"
            style={{
              backgroundColor: isDarkMode ? "#242526" : "#ffffff",
              border: isDarkMode ? "1px solid #3e4042" : "1px solid #e4e6eb",
            }}
          >
            <Avatar src={story.avatarUrl} className="story-avatar" />
            <Typography.Text
              style={{ color: isDarkMode ? "#e4e6eb" : "inherit" }}
            >
              {story.userName}
            </Typography.Text>
          </div>
        ))}
      </Space>
    </div>
  );
};

export default StoryList;
