import { useQuery } from "@tanstack/react-query";
import { Typography } from "antd";
import { Calendar } from "lucide-react";
import {
  formatCustomDate,
  getBackgroundColor,
  getTextColor,
} from "../../@util/helpers";
import { eventApi } from "../../api/event";
import { UpcomingEventsProps } from "../../containers/Sidebar/SidebarRight/interface";
import "./index.css";
import { useEffect } from "react";

const { Title, Text } = Typography;
function UpcomingEvents({
  isDarkMode,
  setIsEvent,
}: UpcomingEventsProps): JSX.Element {
  const { data: myEventsData } = useQuery({
    queryKey: ["events", "my-events"],
    select: (data) => ({
      ...data,
      events: data.data.events
        .sort(
          (a, b) =>
            new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
        )
        .slice(0, 4),
    }),
    queryFn: () => eventApi.getMyEvents(),
  });

  useEffect(() => {
    if (myEventsData?.events.length) {
      setIsEvent(true);
    } else {
      setIsEvent(false);
    }
  }, [setIsEvent, myEventsData]);

  return (
    <div className="sidebar-right-upcoming-events">
      <span
        style={{
          ...getTextColor(isDarkMode),
          ...getBackgroundColor(isDarkMode),
          fontWeight: "bold",
        }}
      >
        Upcoming Events
      </span>
      {myEventsData?.events.map((event) => (
        <div
          key={event.id}
          style={{
            display: "flex",
            alignItems: "flex-start",
            padding: "16px 0",
            gap: "12px",
          }}
        >
          <Calendar
            size={20}
            style={{
              color: isDarkMode ? "#8c8c8c" : "#8c8c8c",
              marginTop: "2px",
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <Title
              level={5}
              style={{
                ...getTextColor(isDarkMode),
                margin: "0 0 4px 0",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              {event.name}
            </Title>
            <Text
              style={{
                color: isDarkMode ? "#8c8c8c" : "#8c8c8c",
                fontSize: "12px",
              }}
            >
              {formatCustomDate(event.eventDate)}
            </Text>
          </div>
        </div>
      ))}
    </div>
  );
}

export default UpcomingEvents;
