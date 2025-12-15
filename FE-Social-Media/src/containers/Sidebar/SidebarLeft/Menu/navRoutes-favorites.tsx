import {
  Bell,
  BookOpen,
  Calendar,
  MessageCircle,
  Settings,
} from "lucide-react";
import { Link } from "react-router-dom";

export const useNavRoutesFavorites = () => {
  return [
    {
      key: "messages",
      icon: <MessageCircle />,
      label: <Link to="/messages">Messages</Link>,
    },
    {
      key: "bookmarks",
      icon: <BookOpen />,
      label: <Link to="/bookmarks">Bookmarks</Link>,
    },
    {
      key: "explore",
      icon: <Calendar />,
      label: <Link to="/events">Events</Link>,
    },
    {
      key: "notifications",
      icon: <Bell />,
      label: <Link to="/notifications">Notifications</Link>,
    },
    {
      key: "settings",
      icon: <Settings />,
      label: <Link to="/settings">Settings</Link>,
    },
  ];
};
