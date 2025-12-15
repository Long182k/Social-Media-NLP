import { Route, Routes } from "react-router-dom";
import GroupList from "./GroupList";
import GroupDetail from "./GroupDetail";

interface GroupsProps {
  isDarkMode: boolean;
}

function Groups({ isDarkMode }: GroupsProps) {
  return (
    <Routes>
      <Route path="/" element={<GroupList isDarkMode={isDarkMode} />} />
      <Route path="/detail" element={<GroupDetail isDarkMode={isDarkMode} />} />
    </Routes>
  );
}

export default Groups;
