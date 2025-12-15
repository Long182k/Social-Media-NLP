import { Card, Col, Row, Statistic, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import adminApi from "../../../api/admin.api";
import { Column } from "@ant-design/plots";

const { Title } = Typography;

interface DashboardProps {
  isDarkMode: boolean;
}

const Dashboard = ({ isDarkMode }: DashboardProps) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: () => adminApi.getDashboardStats(),
  });

  const config = {
    data: stats?.userGrowthData || [],
    isGroup: true,
    xField: "dayName",
    yField: "count",
    columnStyle: {
      fill: isDarkMode ? "#177ddc" : "#597ef7",
      radius: [2, 2, 0, 0],
    },
    label: {
      position: "top",
      style: {
        fill: isDarkMode ? "#ffffff" : "#8c8c8c",
      },
    },
    xAxis: {
      label: {
        autoRotate: false,
        style: {
          fill: isDarkMode ? "#ffffff" : "#000000",
        },
      },
      title: {
        style: {
          fill: isDarkMode ? "#ffffff" : "#000000",
        },
      },
      line: {
        style: {
          stroke: isDarkMode ? "#303030" : "#f0f0f0",
        },
      },
    },
    yAxis: {
      nice: true,
      grid: {
        line: {
          style: {
            stroke: isDarkMode ? "#303030" : "#f0f0f0",
            lineWidth: 1,
            lineDash: [4, 4],
          },
        },
      },
      label: {
        style: {
          fill: isDarkMode ? "#ffffff" : "#000000",
        },
      },
      title: {
        style: {
          fill: isDarkMode ? "#ffffff" : "#000000",
        },
      },
    },
    theme: isDarkMode ? "dark" : "light",
    columnWidthRatio: 0.4,
    height: 300,
    autoFit: true,
    appendPadding: [10, 0, 0, 0],
  };

  const cardStyle = {
    height: "160px",
    background: isDarkMode ? "#141414" : "#ffffff",
  };

  const subtitleStyle = {
    fontSize: "12px",
    color: isDarkMode ? "#8c8c8c" : "#8c8c8c",
  };

  return (
    <div
      style={{ padding: "24px", background: isDarkMode ? "rgb(33,33,33)" : "" }}
    >
      <Title level={2} style={{ color: isDarkMode ? "#ffffff" : "inherit" }}>
        Admin Dashboard
      </Title>

      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card style={cardStyle}>
            <Statistic
              title={
                <span style={{ color: isDarkMode ? "#ffffff" : "inherit" }}>
                  Total Users
                </span>
              }
              value={stats?.totalUsers}
              loading={isLoading}
              valueStyle={{ color: isDarkMode ? "#ffffff" : "inherit" }}
            />
            <div style={subtitleStyle}>System total users</div>
          </Card>
        </Col>

        <Col span={6}>
          <Card style={cardStyle}>
            <Statistic
              title={
                <span style={{ color: isDarkMode ? "#ffffff" : "inherit" }}>
                  Active Users
                </span>
              }
              value={stats?.activeUsers}
              loading={isLoading}
              valueStyle={{ color: isDarkMode ? "#ffffff" : "inherit" }}
            />
            <div style={subtitleStyle}>Active in last 24 hours</div>
          </Card>
        </Col>

        <Col span={6}>
          <Card style={cardStyle}>
            <Statistic
              title={
                <span style={{ color: isDarkMode ? "#ffffff" : "inherit" }}>
                  Total Posts
                </span>
              }
              value={stats?.totalPosts}
              loading={isLoading}
              valueStyle={{ color: isDarkMode ? "#ffffff" : "inherit" }}
            />
            <div style={subtitleStyle}>System total posts</div>
          </Card>
        </Col>

        <Col span={6}>
          <Card style={cardStyle}>
            <Statistic
              title={
                <span style={{ color: isDarkMode ? "#ffffff" : "inherit" }}>
                  Total Events
                </span>
              }
              value={stats?.totalEvents}
              loading={isLoading}
              valueStyle={{ color: isDarkMode ? "#ffffff" : "inherit" }}
            />
            <div style={subtitleStyle}>System total events</div>
          </Card>
        </Col>

        <Col span={6}>
          <Card style={cardStyle}>
            <Statistic
              title={
                <span style={{ color: isDarkMode ? "#ffffff" : "inherit" }}>
                  Post Sentiment
                </span>
              }
              value={stats?.postSentimentRatio.total}
              loading={isLoading}
              valueStyle={{ color: isDarkMode ? "#ffffff" : "inherit" }}
            />
            <div style={{ fontSize: "12px", color: "#52c41a" }}>
              Positive: {stats?.postSentimentRatio.positive.toFixed(1)}%
            </div>
            <div style={{ fontSize: "12px", color: "#ff4d4f" }}>
              Negative: {stats?.postSentimentRatio.negative.toFixed(1)}%
            </div>
            <div
              style={{
                fontSize: "12px",
                color: isDarkMode ? "#d89614" : "#faad14",
              }}
            >
              Moderate: {stats?.postSentimentRatio.moderate.toFixed(1)}%
            </div>
          </Card>
        </Col>

        <Col span={6}>
          <Card style={cardStyle}>
            <Statistic
              title={
                <span style={{ color: isDarkMode ? "#ffffff" : "inherit" }}>
                  Comment Sentiment
                </span>
              }
              value={stats?.commentSentimentRatio.total}
              loading={isLoading}
              valueStyle={{ color: isDarkMode ? "#ffffff" : "inherit" }}
            />
            <div style={{ fontSize: "12px", color: "#52c41a" }}>
              Positive: {stats?.commentSentimentRatio.positive.toFixed(1) ?? 0}%
            </div>
            <div style={{ fontSize: "12px", color: "#ff4d4f" }}>
              Negative: {stats?.commentSentimentRatio.negative.toFixed(1) ?? 0}%
            </div>
            <div
              style={{
                fontSize: "12px",
                color: isDarkMode ? "#d89614" : "#faad14",
              }}
            >
              Moderate: {stats?.commentSentimentRatio.moderate.toFixed(1) ?? 0}%
            </div>
          </Card>
        </Col>

        <Col span={6}>
          <Card style={cardStyle}>
            <Statistic
              title={
                <span style={{ color: isDarkMode ? "#ffffff" : "inherit" }}>
                  Most Positive User
                </span>
              }
              value={stats?.mostPositiveUser.userName}
              loading={isLoading}
              valueStyle={{ color: isDarkMode ? "#ffffff" : "inherit" }}
            />
            <div style={subtitleStyle}>
              {stats?.mostPositiveUser.totalPositive} positive interactions
            </div>
            <div style={{ fontSize: "12px", color: "#52c41a" }}>
              Posts: {stats?.mostPositiveUser.positivePosts} | Comments:{" "}
              {stats?.mostPositiveUser.positiveComments}
            </div>
          </Card>
        </Col>

        <Col span={6}>
          <Card style={cardStyle}>
            <Statistic
              title={
                <span style={{ color: isDarkMode ? "#ffffff" : "inherit" }}>
                  Most Negative User
                </span>
              }
              value={stats?.mostNegativeUser.userName}
              loading={isLoading}
              valueStyle={{ color: isDarkMode ? "#ffffff" : "inherit" }}
            />
            <div style={subtitleStyle}>
              {stats?.mostNegativeUser.totalNegative} negative interactions
            </div>
            <div style={{ fontSize: "12px", color: "#ff4d4f" }}>
              Posts: {stats?.mostNegativeUser.negativePosts} | Comments:{" "}
              {stats?.mostNegativeUser.negativeComments}
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        style={{
          marginTop: "24px",
          background: isDarkMode ? "#141414" : "#ffffff",
        }}
      >
        <Title level={4} style={{ color: isDarkMode ? "#ffffff" : "inherit" }}>
          User Growth Overview
        </Title>
        <Column {...config} />
      </Card>
    </div>
  );
};

export default Dashboard;
