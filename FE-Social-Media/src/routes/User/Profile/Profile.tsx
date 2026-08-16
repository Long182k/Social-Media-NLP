import {
  CameraOutlined,
  CheckOutlined,
  EditOutlined,
  HeartOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, DatePicker, Form, Input, message, Modal, Upload } from "antd";
import moment from "moment";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  followUser,
  getUserById,
  updateAvatar,
  updateCoverPage,
  updateProfile,
} from "../../../api/auth";
import { useAppStore } from "../../../store";
import DetailPageComponent from "./Detail";
import "./Profile.css";

interface ProfileScreenProps {
  isDarkMode: boolean;
}

const ProfileScreen = ({ isDarkMode }: ProfileScreenProps) => {
  const [searchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const { userInfo, updateUserInfo } = useAppStore();
  const queryClient = useQueryClient();
  const [isCopied, setIsCopied] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const userId = searchParams.get("userId") || userInfo?.userId || userInfo?.id;

  const editedUserId = userInfo?.userId || userInfo?.id;

  const { data: userDetail } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });

  const followUserMutation = useMutation({
    mutationFn: followUser,
    onSuccess: (data) => {
      setIsFollowing(data.isFollowing);
      // Force refresh user data to update counts
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      toast.success(
        data.isFollowing ? "Followed successfully" : "Unfollowed successfully"
      );
    },
    onError: (error) => {
      toast.error("Failed to update follow status");
      console.error(error);
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      updateUserInfo({ nickName: updatedUser.nickName });

      // Update form fields with new values
      form.setFieldsValue({
        nickName: updatedUser.nickName,
        bio: updatedUser.bio,
        dateOfBirth: updatedUser.dateOfBirth
          ? moment(updatedUser.dateOfBirth)
          : null,
      });
    },
    onError: (error) => {
      toast.error("Failed to update profile");
      console.error(error);
    },
  });

  const updateAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return await updateAvatar(formData);
    },
    onSuccess: (updatedUser) => {
      toast.success("Avatar updated successfully");
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      updateUserInfo({ avatarUrl: updatedUser.avatarUrl });
    },
    onError: (error) => {
      toast.error("Failed to update avatar");
      console.error(error);
    },
  });

  const updateCoverMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return await updateCoverPage(formData);
    },
    onSuccess: () => {
      toast.success("Cover photo updated successfully");
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    },
    onError: (error) => {
      toast.error("Failed to update cover photo");
      console.error(error);
    },
  });

  const handleProfileUpdate = async (values: {
    nickName: string;
    bio: string;
    dateOfBirth: moment.Moment;
  }) => {
    try {
      await updateProfileMutation.mutate({
        nickName: values.nickName,
        bio: values.bio,
        dateOfBirth: values.dateOfBirth.toISOString(),
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    await updateAvatarMutation.mutateAsync(file);
  };

  const handleCoverUpload = async (file: File) => {
    await updateCoverMutation.mutateAsync(file);
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.resetFields();
  };

  const handleShare = () => {
    const profileUrl = `${window.location.origin}/profile?userId=${userId}`;
    navigator.clipboard.writeText(profileUrl);
    setIsCopied(true);
    message.success("Profile URL copied to clipboard!");

    // Reset the icon after 2 seconds
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const handleFollow = async () => {
    if (!userId) return;
    await followUserMutation.mutateAsync(userId);
  };

  return (
    <div className={`profile-container ${isDarkMode ? "dark" : "light"}`}>
      {/* Cover Photo Section */}
      <div
        className="cover-photo"
        style={{ height: "200px", position: "relative" }}
      >
        <img
          src={
            userDetail?.coverPageUrl ||
            "https://res.cloudinary.com/dcivdqyyj/image/upload/v1736917792/yeapabfhfrqzsajslz4u.jpg"
          }
          alt="Cover"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />

        <Upload
          customRequest={({ file, onSuccess }: any) => {
            handleCoverUpload(file).then(() => onSuccess?.("ok"));
          }}
          showUploadList={false}
          disabled={updateCoverMutation.isPending}
        >
          <Button
            icon={<CameraOutlined />}
            style={{
              position: "absolute",
              bottom: "10px",
              right: "10px",
              backgroundColor: "var(--color-paper)",
              border: "none",
              color: "var(--color-ink-2)",
            }}
            loading={updateCoverMutation.isPending}
          >
            Change Cover
          </Button>
        </Upload>
      </div>

      {/* Profile Info Section */}
      <div className={`profile-info ${isDarkMode ? "dark" : "light"}`}>
        {/* Avatar */}
        <div
          style={{
            marginTop: "-50px",
            position: "relative",
            display: "inline-block",
          }}
        >
          <img
            src={
              userDetail?.avatarUrl ||
              "https://res.cloudinary.com/dcivdqyyj/image/upload/v1736917936/xhqqyeojvg8eghkwhhlv.jpg"
            }
            alt="Avatar"
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              border: "3px solid var(--color-paper)",
            }}
          />
          <Upload
            customRequest={({ file, onSuccess }: any) => {
              handleAvatarUpload(file).then(() => onSuccess?.("ok"));
            }}
            showUploadList={false}
            disabled={updateAvatarMutation.isPending}
          >
            <Button
              icon={<CameraOutlined />}
              style={{
                position: "absolute",
                bottom: "0",
                right: "0",
                backgroundColor: "var(--color-paper-3)",
                border: "none",
                color: "var(--color-ink-2)",
              }}
              shape="circle"
              loading={updateAvatarMutation.isPending}
            />
          </Upload>
        </div>

        {/* Profile Details */}
        <div className="profile-details">
          <div className="profile-header">
            <h2>{userDetail?.nickName}</h2>
            <div className="profile-actions">
              {editedUserId === userDetail?.id ? (
                <Button
                  icon={<EditOutlined />}
                  onClick={() => setIsEditing(true)}
                  style={{
                    backgroundColor: "var(--color-paper-3)",
                    border: "none",
                    color: "var(--color-ink-2)",
                    marginRight: "8px",
                  }}
                >
                  Edit Profile
                </Button>
              ) : (
                <Button
                  icon={<HeartOutlined />}
                  onClick={handleFollow}
                  loading={followUserMutation.isPending}
                  style={{
                    backgroundColor: isFollowing
                      ? "var(--color-accent-2)"
                      : "var(--color-paper-3)",
                    border: "none",
                    color: isFollowing ? "var(--color-paper)" : "var(--color-ink-2)",
                    marginRight: "8px",
                  }}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              )}
              <Button
                icon={isCopied ? <CheckOutlined /> : <ShareAltOutlined />}
                onClick={handleShare}
                style={{
                  backgroundColor: "var(--color-paper-3)",
                  border: "none",
                  color: isCopied ? "var(--color-accent-2)" : "var(--color-ink-2)",
                }}
              >
                {isCopied ? "Copied!" : "Copy Profile URL"}
              </Button>
            </div>
          </div>

          <DetailPageComponent
            userDetail={userDetail}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        title="Edit Profile"
        open={isEditing}
        onCancel={handleCancel}
        footer={null}
        maskClosable={false}
        className={isDarkMode ? "dark-modal" : ""}
      >
        <Form
          form={form}
          onFinish={handleProfileUpdate}
          initialValues={{
            nickName: userDetail?.nickName,
            bio: userDetail?.bio,
            dateOfBirth: userDetail?.dateOfBirth
              ? moment(userDetail.dateOfBirth)
              : null,
          }}
          className={`profile-form ${isDarkMode ? "dark" : "light"}`}
          layout="vertical"
        >
          <Form.Item
            label="Nickname :"
            name="nickName"
            rules={[{ required: true, message: "Nickname is required" }]}
          >
            <Input placeholder="Enter your nick name" />
          </Form.Item>
          <Form.Item label="Date of Birth :" name="dateOfBirth">
            <DatePicker
              style={{ width: "100%" }}
              placeholder="Select your birth date"
              className={isDarkMode ? "dark-date-picker" : ""}
            />
          </Form.Item>
          <Form.Item label="Bio :" name="bio">
            <Input.TextArea
              placeholder="Write something about yourself"
              rows={4}
            />
          </Form.Item>
          <Form.Item className="modal-footer">
            <Button
              onClick={handleCancel}
              style={{ marginRight: 8 }}
              disabled={updateProfileMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={updateProfileMutation.isPending}
            >
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProfileScreen;
