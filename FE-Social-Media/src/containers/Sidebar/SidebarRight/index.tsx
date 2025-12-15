import { Layout } from "antd";
import UpcomingEvents from "../../../components/UpcomingEvents";
import "./index.css";
import { SiderRightProps } from "./interface";
import UpcomingBirthdays from "../../../components/UpcomingBirthdays";
import { useState } from "react";
const { Sider } = Layout;

function SiderRight({ isDarkMode }: SiderRightProps): JSX.Element {
  const [isBirthday, setIsBirthday] = useState(true);
  const [isEvent, setIsEvent] = useState(true);

  if (!isBirthday && !isEvent) return <></>;

  return (
    <Sider
      width={350}
      breakpoint="lg"
      collapsedWidth="0"
      theme={isDarkMode ? "dark" : "light"}
      style={{
        backgroundColor: "#F5F5F5",
        paddingRight: "16px",
      }}
    >
      {isEvent && (
        <UpcomingEvents isDarkMode={isDarkMode} setIsEvent={setIsEvent} />
      )}
      {isBirthday && (
        <UpcomingBirthdays
          isDarkMode={isDarkMode}
          setIsBirthday={setIsBirthday}
        />
      )}
    </Sider>
  );
}

export default SiderRight;
