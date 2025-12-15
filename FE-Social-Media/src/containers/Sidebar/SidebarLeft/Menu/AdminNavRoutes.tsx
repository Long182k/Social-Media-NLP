import {
  CalendarOutlined,
  DashboardOutlined,
  SettingOutlined,
  UsergroupAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

export const useAdminNavRoutes = () => {

  return [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">Dashboard</Link>,
    },
    {
      key: "user-management",
      icon: <UserOutlined />,
      label: <Link to="/user-management">User Management</Link>,
    },
    {
      key: "group-management",
      icon: <UsergroupAddOutlined />,
      label: <Link to="/group-management">Group Management</Link>,
    },
    {
      key: "event-management",
      icon: <CalendarOutlined />,
      label: <Link to="/event-management">Event Management</Link>,
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: <Link to="/settings">Settings</Link>,
    },
  ];
};
