import { Route, Routes } from "react-router-dom";
import ProfileScreen from "./Profile";

interface ProfileProps {
  isDarkMode: boolean;
}

function Profile({ isDarkMode }: ProfileProps) {
  return (
    <Routes>
      <Route path="/" element={<ProfileScreen isDarkMode={isDarkMode} />} />
    </Routes>
  );
}

export default Profile;
