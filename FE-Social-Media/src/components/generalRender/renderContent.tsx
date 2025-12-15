import { Space, Typography } from "antd";

export const renderContent = (content?: string, isDarkMode?: boolean) => {
  // Split content by newlines to handle different paragraphs
  const paragraphs = content?.split("\n").filter((line) => line.trim());

  return (
    <Space direction="vertical" style={{ width: "100%" }} size={8}>
      {paragraphs?.map((paragraph, index) => {
        // Check if the line starts with a number followed by a dot (e.g., "1.")
        const isListItem = /^\d+\./.test(paragraph);

        if (isListItem) {
          return (
            <Typography.Text
              key={index}
              style={{
                color: isDarkMode ? "#ffffff99" : "#00000099",
                fontSize: "14px",
                display: "block",
                paddingLeft: "20px",
              }}
            >
              {paragraph}
            </Typography.Text>
          );
        }

        return (
          <Typography.Paragraph
            key={index}
            style={{
              color: isDarkMode ? "#ffffff99" : "#00000099",
              fontSize: "14px",
              margin: 0,
            }}
          >
            {paragraph}
          </Typography.Paragraph>
        );
      })}
    </Space>
  );
};
