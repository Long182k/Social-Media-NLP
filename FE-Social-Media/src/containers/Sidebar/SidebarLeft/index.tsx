import { Divider, Layout } from "antd";
import Groups from "./Contacts";
import Logo from "./Logo";

import "./index.css";
import AdminMenuItems from "./Menu/AdminMenus";
import { useAppStore } from "../../../store";
import { MenuItems } from "./Menu";

const { Sider } = Layout;

interface SidebarLeftProps {
  isDarkMode: boolean;
}

function SidebarLeft({ isDarkMode }: SidebarLeftProps): JSX.Element {
  const { userInfo } = useAppStore();
  const isAdmin = userInfo?.role === "ADMIN";

  return (
    <Sider
      width={250}
      style={isDarkMode ? { background: "#1f1f1f" } : { background: "#ffffff" }}
    >
      <Logo isDarkMode={isDarkMode} />

      {isAdmin ? (
        <AdminMenuItems isDarkMode={isDarkMode} />
      ) : (
        <MenuItems isDarkMode={isDarkMode} />
      )}

      <Divider />
      {!isAdmin && <Groups isDarkMode={isDarkMode} />}
    </Sider>
  );
}

export default SidebarLeft;
