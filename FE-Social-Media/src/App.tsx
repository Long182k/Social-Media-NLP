import { ApolloProvider } from "@apollo/client/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ConfigProvider } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { queryClient } from "./@util/lib/queryClient";
import { apolloClient } from "./api/apolloClient";
import "./App.css";
import CenterContent from "./containers/CenterLayout/CenterContent";
import { humDarkTheme, humLightTheme } from "./theme/antdTheme";
import Dashboard from "./routes/Admin/Dashboard";
import EventManagement from "./routes/Admin/Event Management";
import GroupManagement from "./routes/Admin/Group Management";
import UserManagement from "./routes/Admin/User Management";
import Bookmarks from "./routes/User/Bookmarks";
import Events from "./routes/User/Events";
import Groups from "./routes/User/Groups";
import HomePage from "./routes/User/Home";
import LoginPage from "./routes/User/Login";
import Messages from "./routes/User/Messages";
import Notifications from "./routes/User/Notifications";
import Profile from "./routes/User/Profile";
import Settings from "./routes/User/Settings";
import { useAppStore } from "./store";

interface ProtectedRouterProps {
  component: React.ReactElement;
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const { userInfo } = useAppStore();

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDarkMode ? "dark" : "light"
    );
    document.body.style.backgroundColor = isDarkMode
      ? "#23242e"
      : "oklch(97% 0.012 95)";
    document.body.style.color = isDarkMode ? "#f3f0e6" : "oklch(20% 0.012 250)";
  }, [isDarkMode]);

  // Initialize socket connection and axios auth on app mount
  // useSocketInitializer();

  const accessToken = userInfo?.accessToken;

  const ProtectedRouter = ({ component }: ProtectedRouterProps) => {
    if (accessToken) {
      return component;
    } else {
      return <Navigate replace to="/login" />;
    }
  };

  const ProtectedAdminRoute = ({ component }: ProtectedRouterProps) => {
    if (accessToken && userInfo?.role === "ADMIN") {
      return component;
    } else {
      return <Navigate replace to="/login" />;
    }
  };

  const handleThemeChange = (
    checked: boolean | ((prevState: boolean) => boolean)
  ) => {
    setIsDarkMode(checked);
  };

  axios.defaults.withCredentials = true;

  const antdConfig = isDarkMode ? humDarkTheme : humLightTheme;

  return (
    <div>
      <ApolloProvider client={apolloClient}>
        <QueryClientProvider client={queryClient}>
          <ConfigProvider theme={antdConfig}>
            <BrowserRouter>
            <Routes>
              {/* Wrap protected routes inside Layout */}
              <Route
                path="/"
                element={
                  <ProtectedRouter
                    component={<HomePage isDarkMode={isDarkMode} />}
                  />
                }
              >
                <Route
                  index
                  element={
                    <CenterContent
                      isDarkMode={isDarkMode}
                      currentUserId={userInfo?.userId ?? userInfo?.id}
                      userAvatar={userInfo?.avatarUrl ?? ""}
                    />
                  }
                />
                <Route
                  path="events/*"
                  element={<Events isDarkMode={isDarkMode} />}
                />
                <Route
                  path="groups/*"
                  element={<Groups isDarkMode={isDarkMode} />}
                />
                <Route
                  path="bookmarks"
                  element={
                    <Bookmarks isDarkMode={isDarkMode} userDetail={userInfo} />
                  }
                />
                <Route
                  path="messages"
                  element={
                    <Messages
                      isDarkMode={isDarkMode}
                      currentUserId={userInfo?.userId ?? userInfo?.id}
                    />
                  }
                />
                <Route
                  path="notifications"
                  element={<Notifications isDarkMode={isDarkMode} />}
                />
                <Route
                  path="profile/*"
                  element={<Profile isDarkMode={isDarkMode} />}
                />
                <Route
                  path="settings"
                  element={
                    <Settings
                      isDarkMode={isDarkMode}
                      handleThemeChange={handleThemeChange}
                    />
                  }
                />

                {/* Admin routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedAdminRoute
                      component={<Dashboard isDarkMode={isDarkMode} />}
                    />
                  }
                />
                <Route
                  path="/user-management"
                  element={
                    <ProtectedAdminRoute
                      component={<UserManagement isDarkMode={isDarkMode} />}
                    />
                  }
                />
                <Route
                  path="/event-management"
                  element={
                    <ProtectedAdminRoute
                      component={<EventManagement isDarkMode={isDarkMode} />}
                    />
                  }
                />
                <Route
                  path="/group-management"
                  element={
                    <ProtectedAdminRoute
                      component={<GroupManagement isDarkMode={isDarkMode} />}
                    />
                  }
                />
              </Route>

              {/* Other routes outside layout */}
              <Route path="/login" element={<LoginPage />} />
            </Routes>
            </BrowserRouter>
          </ConfigProvider>

          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
        <ToastContainer position="top-right" theme="dark" />
      </ApolloProvider>
    </div>
  );
}

export default App;
