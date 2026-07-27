import { useQuery } from "@tanstack/react-query";
import { Avatar, List, Typography } from "antd";
import { UsersRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getGroupColor, getTextColor } from "../../../../@util/helpers";
import { groupApi } from "../../../../api/group";
import { GroupsProps } from "./group.interface";
const { Title, Text } = Typography;

function Groups({ isDarkMode }: GroupsProps): JSX.Element {
  const navigate = useNavigate();

  const { data: myGroupsData } = useQuery({
    queryKey: ["groups", "joined"],
    queryFn: () => groupApi.getGroups(true),
  });

  const groupList = Array.isArray(myGroupsData)
    ? myGroupsData
    : Array.isArray((myGroupsData as any)?.data)
    ? (myGroupsData as any).data
    : Array.isArray((myGroupsData as any)?.groups)
    ? (myGroupsData as any).groups
    : [];

  const getGroupInitials = (groupName?: string): string => {
    if (!groupName) return "GR";
    return groupName
      .split(" ")
      .map((name) => name.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2);
  };

  const handleOnClick = () => {
    navigate("/groups");
  };

  return (
    <div className="contacts">
      <div
        style={{ display: "flex", cursor: "pointer" }}
        onClick={handleOnClick}
      >
        <UsersRound style={{ marginRight: 8 }} />
        <Title level={5} style={{ ...getTextColor(isDarkMode) }}>
          Groups
        </Title>
      </div>

      <List
        style={{ marginLeft: 12 }}
        dataSource={groupList}
        renderItem={(item: any) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Avatar
                  style={{
                    backgroundColor: getGroupColor(item?.name || "Group"),
                    color: "#ffffff",
                    fontWeight: "bold",
                  }}
                >
                  {getGroupInitials(item?.name)}
                </Avatar>
              }
              title={
                <Text
                  strong
                  className={isDarkMode ? "text-dark" : "text-light"}
                >
                  {item?.name || "Unnamed Group"}
                </Text>
              }
              description={
                <Text style={{ color: isDarkMode ? "#ffffff99" : "#00000073" }}>
                  {item?.description || ""}
                </Text>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
}

export default Groups;
