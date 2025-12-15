import { Typography } from "antd";
import { LogoProps } from "./logo.interface";

const { Title } = Typography;

function Logo({ isDarkMode }: LogoProps): JSX.Element {
  return (
    <div className="logo">
      <Title
        level={3}
        style={{
          margin: "12px",
          color: isDarkMode ? "#ffffff" : "#1E90FF	",
        }}
      >
        Connected
      </Title>
    </div>
  );
}

export default Logo;
