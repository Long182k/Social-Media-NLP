import { Layout } from "antd";
import "antd/dist/reset.css";
import { Outlet, useLocation } from "react-router-dom";
import SidebarLeft from "../../../containers/Sidebar/SidebarLeft";
import SiderRight from "../../../containers/Sidebar/SidebarRight";
import SiderRight2 from "../../../containers/Sidebar/SidebarRight2";
import { useAppStore } from "../../../store";
import "./index.css";

interface HomePageProps {
  isDarkMode: boolean;
}

const HomePage = ({ isDarkMode }: HomePageProps) => {
  const { userInfo } = useAppStore();
  const location = useLocation();

  const isAdmin = userInfo?.role === "ADMIN";

  return (
    <Layout className="homepage-layout">
      <SidebarLeft isDarkMode={isDarkMode} />

      <Layout className="main-content-layout">
        <div
          className="scrollable-content"
          style={{ backgroundColor: isDarkMode ? "" : "rgb(245, 245, 245)" }}
        >
          <Outlet />
        </div>
      </Layout>
      {location.pathname === "/" && !isAdmin && (
        <SiderRight isDarkMode={isDarkMode} />
      )}
      {location.pathname === "/" && !isAdmin && (
        <SiderRight2 isDarkMode={isDarkMode} />
      )}
    </Layout>
  );
};

export default HomePage;
