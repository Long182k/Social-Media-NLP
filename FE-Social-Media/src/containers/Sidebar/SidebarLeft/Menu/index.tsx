import { Menu, Typography } from "antd";
import { Star } from "lucide-react";
import { cloneElement } from "react";
import { useLocation } from "react-router-dom";
import "./menuItems.css";
import { MenuItemsProps } from "./menuItems.interface";
import { useNavRoutes } from "./navRoutes";
import { useNavRoutesFavorites } from "./navRoutes-favorites";

export function MenuItems({ isDarkMode }: MenuItemsProps): JSX.Element {
  const location = useLocation();
  const navRoutes = useNavRoutes();
  const navRoutesFavorites = useNavRoutesFavorites();
  const { Text } = Typography;

  // Get the base path for selection
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.startsWith("/events")) return "events";
    if (path.startsWith("/groups")) return "groups";
    if (path.startsWith("/bookmarks")) return "bookmarks";
    if (path.startsWith("/profile")) return "profile";
    if (path.startsWith("/messages")) return "messages";
    if (path.startsWith("/notifications")) return "notifications";
    if (path.startsWith("/settings")) return "settings";

    return "home";
  };

  return (
    <>
      <Menu
        className="menu-sider-left"
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        style={{ borderRight: 0 }}
        theme={isDarkMode ? "dark" : "light"}
        items={navRoutes.map((item) => ({
          ...item,
          style: { marginBottom: "12px" },
          icon: cloneElement(item.icon, { style: { fontSize: "20px" } }),
          label: (
            <span
              className={isDarkMode ? "text-dark" : "text-light"}
              style={{ fontSize: "16px", fontWeight: "500" }}
            >
              {item.label}
            </span>
          ),
        }))}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "4px 12px",
          marginBottom: "8px",
        }}
      >
        <Star
          size={20}
          style={{
            marginRight: "8px",
            color: "grey",
          }}
        />
        <Text
          style={{
            fontSize: "16px",
            color: "grey",
          }}
        >
          Favorites
        </Text>
      </div>
      <Menu
        className="menu-sider-left"
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        style={{ borderRight: 0 }}
        theme={isDarkMode ? "dark" : "light"}
        items={navRoutesFavorites.map((item) => ({
          ...item,
          style: { marginBottom: "12px" },
          icon: cloneElement(item.icon, {
            style: { fontSize: "12px", color: "grey" },
          }),
          label: (
            <span
              className={isDarkMode ? "text-dark" : "text-light"}
              style={{ fontSize: "16px", color: "#625757" }}
            >
              {item.label}
            </span>
          ),
        }))}
      />
    </>
  );
}
