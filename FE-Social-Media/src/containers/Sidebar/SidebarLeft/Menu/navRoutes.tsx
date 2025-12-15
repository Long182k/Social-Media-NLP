import { Home, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppStore } from "../../../../store";

export const useNavRoutes = () => {
  const { userInfo } = useAppStore();

  const userId = userInfo?.userId || userInfo?.id;

  return [
    {
      key: "home",
      icon: <Home />,
      label: <Link to="/">Home</Link>,
    },
    {
      key: "profile",
      icon: <User />,
      label: <Link to={`/profile?userId=${userId}`}>Profile</Link>,
    },
  ];
};
