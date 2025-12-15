import { Route, Routes } from "react-router-dom";
import EventDetail from "./EventDetail";
import EventList from "./EventList";

interface ExploreProps {
  isDarkMode: boolean;
}

function Events({ isDarkMode }: ExploreProps) {
  return (
    <Routes>
      <Route path="/" element={<EventList isDarkMode={isDarkMode} />} />
      <Route path="/detail" element={<EventDetail isDarkMode={isDarkMode} />} />
    </Routes>
  );
}

export default Events;
