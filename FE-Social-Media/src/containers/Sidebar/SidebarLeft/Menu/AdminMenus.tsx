import { Menu } from "antd";
import "./menuItems.css";
import { MenuItemsProps } from "./menuItems.interface";
import { useLocation } from "react-router-dom";
import { useAdminNavRoutes } from "./AdminNavRoutes";

function AdminMenuItems({ isDarkMode }: MenuItemsProps): JSX.Element {
  const location = useLocation();
  const navRoutes = useAdminNavRoutes();

  // Get the base path for selection
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.startsWith("/dashboard")) return "dashboard";
    if (path.startsWith("/user-management")) return "user-management";
    if (path.startsWith("/group-management")) return "group-management";
    if (path.startsWith("/event-management")) return "event-management";
    if (path.startsWith("/settings")) return "settings";

    return "dashboard";
  };

  return (
    <Menu
      className="menu-sider-left"
      mode="inline"
      selectedKeys={[getSelectedKey()]}
      style={{ borderRight: 0 }}
      theme={isDarkMode ? "dark" : "light"}
      items={navRoutes.map((item) => ({
        ...item,
        label: (
          <span className={isDarkMode ? "text-dark" : "text-light"}>
            {item.label}
          </span>
        ),
      }))}
    />
  );
}

export default AdminMenuItems;
