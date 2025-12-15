import { useQuery } from "@tanstack/react-query";
import { Avatar, Typography } from "antd";
import { useEffect } from "react";
import {
  formatCustomDateMonth,
  getBackgroundColor,
  getTextColor,
} from "../../@util/helpers";
import { getRecentBirthday } from "../../api/auth";
import { UpcomingBirthdaysProps } from "../../containers/Sidebar/SidebarRight/interface";
import "./index.css";

const { Title, Text } = Typography;

function UpcomingBirthdays({
  isDarkMode,
  setIsBirthday,
}: UpcomingBirthdaysProps): JSX.Element {
  const { data: recentBirthdayData } = useQuery({
    queryKey: ["events", "recent-birthdays"],
    queryFn: () => getRecentBirthday(1, 10),
  });

  useEffect(() => {
    if (recentBirthdayData?.latestBirthday.length) {
      setIsBirthday(true);
    } else {
      setIsBirthday(false);
    }
  }, [recentBirthdayData, setIsBirthday]);

  // Function to calculate age
  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age + 1; // Next birthday age
  };

  // Function to get user initials for avatar
  const getUserInitials = (userName: string): string => {
    return userName
      .split(" ")
      .map((name) => name.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2);
  };

  // Group birthdays by date
  const groupedBirthdays =
    recentBirthdayData?.latestBirthday.reduce((acc: any, event: any) => {
      const dateKey = formatCustomDateMonth(event.dateOfBirth);
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(event);

      return acc;
    }, {}) || {};

  const colors = ["#1890ff", "#722ed1", "#52c41a", "#fa541c", "#eb2f96"];

  return (
    <div className="sidebar-right-upcoming-events">
      <span
        style={{
          ...getTextColor(isDarkMode),
          ...getBackgroundColor(isDarkMode),
          fontWeight: "bold",
          marginBottom: "16px",
          display: "block",
        }}
      >
        Birthdays
      </span>

      {Object.entries(groupedBirthdays).map(([date, events]: [string, any]) => (
        <div key={date} style={{ marginBottom: "24px" }}>
          <Text
            style={{
              color: isDarkMode ? "#8c8c8c" : "#8c8c8c",
              fontSize: "14px",
              fontWeight: "500",
              marginBottom: "12px",
              display: "block",
            }}
          >
            {date}
          </Text>

          {events.map((event: any, index: number) => (
            <div
              key={event.id}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 0",
                gap: "12px",
              }}
            >
              <Avatar
                size={40}
                src={event.avatarUrl}
                style={{
                  backgroundColor: event.avatarUrl
                    ? undefined
                    : colors[index % colors.length],
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                {!event.avatarUrl && getUserInitials(event.userName)}
              </Avatar>

              <div style={{ flex: 1 }}>
                <Title
                  level={5}
                  style={{
                    ...getTextColor(isDarkMode),
                    margin: "0 0 2px 0",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  {event.userName}
                </Title>
                <Text
                  style={{
                    color: isDarkMode ? "#8c8c8c" : "#8c8c8c",
                    fontSize: "12px",
                  }}
                >
                  Turning {calculateAge(event.dateOfBirth)} years old
                </Text>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default UpcomingBirthdays;
