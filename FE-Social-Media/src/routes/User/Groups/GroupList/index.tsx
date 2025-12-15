import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  Layout,
  Row,
  Tabs,
  Typography,
  Modal,
  Form,
  Input,
  Upload,
} from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Group, groupApi } from "../../../../api/group";
import "./index.css";

const { Title, Text } = Typography;

interface GroupListProps {
  isDarkMode: boolean;
}

function GroupList({ isDarkMode }: GroupListProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const groupType = searchParams.get("groupType") || "joined";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);

  // Queries
  const { data: myGroups } = useQuery({
    queryKey: ["groups", "joined"],
    queryFn: () => groupApi.getGroups(true),
    enabled: groupType === "joined",
  });

  const { data: exploreGroups } = useQuery({
    queryKey: ["groups", "exploring"],
    queryFn: () => groupApi.getGroups(false),
    enabled: groupType === "exploring",
  });

  // Mutations
  const createGroupMutation = useMutation({
    mutationFn: async (values: {
      name: string;
      description: string;
      file?: File;
    }) => {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description);
      if (values.file) {
        formData.append("file", values.file);
      }
      return groupApi.createGroup(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setIsModalOpen(false);
      form.resetFields();
      setFileList([]);
    },
  });

  const joinGroupMutation = useMutation({
    mutationFn: groupApi.requestJoinGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      // queryClient.invalidateQueries({ queryKey: ["joinRequests", groupId] });
    },
  });

  const handleTabChange = (type: string) => {
    navigate(`/groups?groupType=${type}`);
  };

  const handleGroupClick = (group: Group) => {
    if (groupType === "joined") {
      navigate(`/groups/detail?groupId=${group.id}`, {
        state: {
          groupName: group.name,
        },
      });
    }
  };

  const handleCreateGroup = async (values: any) => {
    const file = fileList[0]?.originFileObj;
    await createGroupMutation.mutate({
      name: values.name,
      description: values.description,
      file,
    });
  };

  const renderGroups = (groups: Group[] = [], isJoined: boolean) => (
    <Row gutter={[24, 24]}>
      {groups.map((group) => (
        <Col xs={24} sm={12} md={8} key={group.id}>
          <Card
            onClick={() => handleGroupClick(group)}
            cover={
              <div className="group-cover-image">
                <img
                  alt={group.name}
                  src={
                    group.groupAvatar || "https://via.placeholder.com/400x200"
                  }
                  style={{ width: "100%", height: "200px", objectFit: "cover" }}
                />
              </div>
            }
            className="group-card"
            style={{
              background: isDarkMode ? "#1f1f1f" : "#ffffff",
              border: `1px solid ${isDarkMode ? "#303030" : "#f0f0f0"}`,
              cursor: isJoined ? "pointer" : "default",
            }}
          >
            <Title
              level={4}
              style={{
                color: isDarkMode ? "#ffffff" : "#000000",
                marginBottom: 8,
              }}
            >
              {group.name}
            </Title>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <img
                src={
                  group.creator.avatarUrl ||
                  "https://res.cloudinary.com/dcivdqyyj/image/upload/v1736957755/sq1svii2veo8hewyelud.jpg"
                }
                alt={group.creator.userName}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  marginRight: 8,
                }}
              />
              <Text
                style={{
                  color: isDarkMode ? "#ffffff99" : "#00000099",
                }}
              >
                Created by {group.creator.userName}
              </Text>
            </div>
            <Text
              style={{
                color: isDarkMode ? "#ffffff99" : "#00000099",
                display: "block",
                marginBottom: 16,
              }}
            >
              {group._count?.members.toLocaleString()} members
            </Text>
            {!isJoined && (
              <Button
                type="primary"
                block
                onClick={(e) => {
                  e.stopPropagation();
                  joinGroupMutation.mutate(group.id);
                }}
                disabled={group.members?.some(
                  (member) => member.role === "PENDING"
                )}
                loading={joinGroupMutation.isPending}
                style={{
                  background: group.members?.some(
                    (member) => member.role === "PENDING"
                  )
                    ? "#808080"
                    : "#000000",
                  height: "40px",
                  borderRadius: "6px",
                  color: group.members?.some(
                    (member) => member.role === "PENDING"
                  )
                    ? "#ffffff"
                    : undefined,
                }}
              >
                {group.members?.some((member) => member.role === "PENDING")
                  ? "Waiting for admin's approval"
                  : "Join Group"}
              </Button>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );

  const items = [
    {
      key: "joined",
      label: "My Groups",
      children: renderGroups(myGroups, true),
    },
    {
      key: "exploring",
      label: "Events Groups",
      children: renderGroups(exploreGroups, false),
    },
  ];

  return (
    <Layout
      style={{
        background: isDarkMode ? "#141414" : "#ffffff",
      }}
    >
      <div className="group-list-container">
        <div className="group-header">
          <div></div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
            className="create-group-button"
            style={{
              background: "#000000",
              border: "none",
            }}
          >
            Create Group
          </Button>
        </div>
        <Tabs
          activeKey={groupType}
          onChange={handleTabChange}
          items={items}
          className={`groups-tab-container ${isDarkMode ? "dark" : ""}`}
        />

        <Modal
          title="Create New Group"
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            form.resetFields();
            setFileList([]);
          }}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleCreateGroup}>
            <Form.Item
              name="name"
              label="Group Name"
              rules={[{ required: true, message: "Please input group name!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true, message: "Please input group description!" },
              ]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item label="Group Avatar" name="groupAvatar">
              <Upload
                beforeUpload={() => false}
                maxCount={1}
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
              >
                <Button icon={<UploadOutlined />}>Select Image</Button>
              </Upload>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={createGroupMutation.isPending}
                style={{
                  background: "#000000",
                  border: "none",
                  width: "100%",
                }}
              >
                Create Group
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Layout>
  );
}

export default GroupList;
