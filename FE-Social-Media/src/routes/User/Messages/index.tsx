import {
  CloseCircleOutlined,
  PaperClipOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Image,
  Input,
  Layout,
  List,
  Modal,
  Select,
  Space,
  Typography,
  Upload,
} from "antd";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { User } from "../../../@util/types/auth.type";

import type { UploadFile } from "antd/es/upload/interface";
import { Search, UserRoundPlus, ExternalLink } from "lucide-react";
import Plyr from "plyr-react";
import { convertToHumanTime, formatShortTimeAgo } from "../../../@util/helpers";
import {
  ChatMessageResponse,
  ChatRoom,
} from "../../../@util/interface/chat.interface";
import { useAppStore } from "../../../store";
import "./index.css";
import mql from "@microlink/mql";

const { Text } = Typography;

type MessageProps = {
  currentUserId: string;
  isDarkMode: boolean;
};

function MessageApp({ currentUserId, isDarkMode }: MessageProps) {
  const {
    messages,
    socket,
    selectedChatRoom,
    setSelectedChatRoom,
    fetchAvailableContacts,
    getMessages,
    getChatRoom,
    sendMessage,
    createDirectChat,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useAppStore();

  const [content, setContent] = useState("");
  const [contactsModalVisible, setContactsModalVisible] = useState(false);
  const [_, setChatDetailVisible] = useState(false);
  const [modalType, setModalType] = useState<"DIRECT" | "GROUP">("DIRECT");
  const [nameChatRoom, setNameChatRoom] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [linkTitles, setLinkTitles] = useState<Record<string, string>>({});

  const { userInfo } = useAppStore();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const userId = userInfo.userId ?? userInfo.userId;

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const isInitialMount = useRef(true);

  const queryClient = useQueryClient();

  const scrollToBottom = (smooth = true) => {
    requestAnimationFrame(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: smooth ? "smooth" : "auto",
        });
      }
    });
  };

  const handleSelectChatRoom = (room: ChatRoom) => {
    setChatDetailVisible(true);
    if (selectedChatRoom?.id !== room.id) {
      setSelectedChatRoom(room);

      // Use cache instead of fetching on every click
      const cached = queryClient.getQueryData<ChatMessageResponse[]>([
        "messages",
        room.id,
      ]);

      if (!cached) {
        // Warm the cache without forcing a re-render
        queryClient.prefetchQuery({
          queryKey: ["messages", room.id],
          queryFn: () => getMessages(room.id),
        });
      }

      setTimeout(() => scrollToBottom(false), 100);
    }
  };

  useEffect(() => {
    if (selectedChatRoom && currentUserId) {
      const receiver = selectedChatRoom?.participants.find(
        (participant) => participant.userId !== currentUserId
      );

      if (receiver) {
        setSelectedUser(receiver.userId);
      }
    }
  }, [selectedChatRoom, currentUserId]);

  useLayoutEffect(() => {
    if (messages && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    if (selectedChatRoom && messages && messages.length > 0) {
      setTimeout(() => scrollToBottom(false), 50);
    }
  }, [messages, selectedChatRoom, selectedChatRoom?.id]);

  useEffect(() => {
    if (
      isInitialMount.current &&
      selectedChatRoom &&
      messages &&
      messages.length > 0
    ) {
      isInitialMount.current = false;
      setTimeout(() => scrollToBottom(false), 200);
    }
  }, [selectedChatRoom, messages]);

  useEffect(() => {
    // Subscribe to messages
    subscribeToMessages();

    return () => {
      unsubscribeFromMessages();
    };
  }, [socket, subscribeToMessages, unsubscribeFromMessages]);

  const { data: chatRoomsQuery, refetch: refetchChatRooms } = useQuery<
    ChatRoom[],
    Error
  >({
    queryKey: ["chatRooms", currentUserId],
    queryFn: () => getChatRoom(currentUserId),
  });

  useEffect(() => {
    if (chatRoomsQuery && chatRoomsQuery.length > 0) {
      setChatDetailVisible(true);
    }
  }, [chatRoomsQuery]);

  const { data: contactsQuery, isLoading: isLoadingContacts } = useQuery({
    queryKey: ["contacts"],
    queryFn: fetchAvailableContacts,
    refetchOnWindowFocus: false,
  });

  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({
        queryKey: ["chatRooms", currentUserId],
      });
      setTimeout(() => scrollToBottom(), 100);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createDirectChatMutation = useMutation({
    mutationFn: createDirectChat,
    onSuccess: (newChatRoom) => {
      handleSelectChatRoom(newChatRoom);
      setContactsModalVisible(false);
      queryClient.invalidateQueries({
        queryKey: ["messages", selectedChatRoom?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["chatRooms", currentUserId],
      });
      refetchChatRooms();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleFileChange = ({
    fileList: newFileList,
  }: {
    fileList: UploadFile[];
  }) => {
    setFileList(newFileList);
  };

  const removePreviewFile = (fileToRemove: UploadFile) => {
    setFileList((prev) => prev.filter((f) => f.uid !== fileToRemove.uid));
  };

  const handleSendMessage = () => {
    if (!content.trim() || !selectedChatRoom) return;

    const formData = new FormData();
    formData.append("content", content);
    formData.append("chatRoomId", selectedChatRoom.id);
    formData.append("senderId", currentUserId);
    formData.append("receiverId", selectedUser);

    if (fileList.length > 0) {
      fileList
        .map((file) => file.originFileObj)
        .filter((file): file is File => file !== undefined)
        .forEach((file) => {
          formData.append("files", file);
        });
    }

    sendMessageMutation.mutate(formData);
    setFileList([]);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleCreateDirectChat = () => {
    if (!selectedUser) return;
    createDirectChatMutation.mutate({
      senderId: currentUserId,
      receiverId: selectedUser,
      type: modalType,
      name: nameChatRoom,
    });
  };

  const otherParticipant =
    selectedChatRoom?.participants?.find((p) => p.userId !== currentUserId)
      ?.user ?? null;

  const allAttachments =
    messages?.flatMap((m) => (m as any)?.attachments ?? []) ?? [];

  const sharedImages = allAttachments.filter(
    (a: any) => a?.type === "image" && a?.url
  );
  const sharedVideos = allAttachments.filter(
    (a: any) => a?.type === "video" && a?.url
  );

  const sharedLinks = useMemo(() => {
    return (
      messages?.flatMap((m) => {
        const matches = (m.content ?? "").match(/https?:\/\/\S+/g);
        return matches ?? [];
      }) ?? []
    );
  }, [messages]);

  useEffect(() => {
    const uniqueLinks = Array.from(
      new Set(sharedLinks.filter((href) => /^https?:\/\/\S+$/i.test(href)))
    );
    if (uniqueLinks.length === 0) return;

    let cancelled = false;

    (async () => {
      const updates: Record<string, string> = {};

      await Promise.all(
        uniqueLinks.map(async (href) => {
          if (linkTitles[href]) return;

          try {
            const { data } = await mql(href, {
              apiKey: (import.meta as any)?.env?.VITE_MICROLINK_API_KEY,
              data: { title: "title" },
              timeout: 8000,
            } as any);

            const title =
              (data as any)?.title ||
              new URL(href).hostname.replace(/^www\./, "");

            updates[href] = title || "Link";
          } catch {
            try {
              const host = new URL(href).hostname.replace(/^www\./, "");
              updates[href] = host
                ? host.charAt(0).toUpperCase() + host.slice(1)
                : "Link";
            } catch {
              updates[href] = "Link";
            }
          }
        })
      );

      if (!cancelled && Object.keys(updates).length > 0) {
        setLinkTitles((prev) => ({ ...prev, ...updates }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sharedLinks, linkTitles]);

  const getLinkTitle = (href: string) => {
    if (linkTitles[href]) return linkTitles[href];
    try {
      const url = new URL(href);
      const host = url.hostname.replace(/^www\./, "");
      return host ? host.charAt(0).toUpperCase() + host.slice(1) : "Link";
    } catch {
      return "Link";
    }
  };

  const showModal = (type: "DIRECT" | "GROUP", name: string) => {
    setModalType(type);
    setNameChatRoom(name);
    setContactsModalVisible(true);
  };

  return (
    <Layout
      style={{
        background: isDarkMode ? "rgb(0 0 0)" : "rgb(245, 245, 245)",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Layout.Sider
        width={260}
        style={{
          background: isDarkMode ? "rgb(0 0 0)" : "rgb(245, 245, 245)",
          height: "100%",
          overflowY: "auto",
          borderRight: `1px solid ${isDarkMode ? "#3F4147" : "#e4e6eb"}`,
        }}
      >
        <div style={{ padding: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Typography.Title
              level={5}
              style={{ color: isDarkMode ? "#96989D" : "#65676b", margin: 0 }}
            >
              Chats
            </Typography.Title>
            <Button
              type="text"
              icon={
                <UserRoundPlus
                  size={20}
                  style={{
                    color: isDarkMode ? "#96989D" : "#65676b",
                  }}
                />
              }
              onClick={() => showModal("DIRECT", "hi")}
            />
          </div>

          <Input
            placeholder="Search in chats"
            style={{
              marginBottom: 16,
              borderRadius: 8,
              background: isDarkMode ? "#1f1f1f" : "#ffffff",
              border: `1px solid ${isDarkMode ? "#303030" : "#e4e6eb"}`,
            }}
            prefix={
              <Search
                size={20}
                style={{ color: isDarkMode ? "#96989D" : "#c6c6c6ff" }}
              />
            }
          />

          <List
            dataSource={(chatRoomsQuery || []).filter(
              (room) => room?.type === "DIRECT"
            )}
            renderItem={(room) => (
              <List.Item
                key={room.id}
                onClick={() => handleSelectChatRoom(room)}
                style={{
                  padding: 10,
                  cursor: "pointer",
                  borderRadius: 8,
                  background:
                    selectedChatRoom?.id === room.id
                      ? isDarkMode
                        ? "#2c2f36"
                        : "#f0f2f5"
                      : "transparent",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    width: "100%",
                  }}
                >
                  <Avatar
                    size={32}
                    src={
                      room.participants?.find((p) => p.userId !== currentUserId)
                        ?.user?.avatarUrl
                    }
                    style={{
                      backgroundColor: "#3b82f6",
                      color: "#fff",
                      fontWeight: 600,
                    }}
                  >
                    {
                      room.participants?.find((p) => p.userId !== currentUserId)
                        ?.user?.userName?.[0]
                    }
                  </Avatar>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <Text
                        style={{
                          color: isDarkMode ? "#e5e7eb" : "#111827",
                          fontWeight: 600,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          flex: 1,
                        }}
                      >
                        {
                          room.participants?.find(
                            (p) => p.userId !== currentUserId
                          )?.user?.userName
                        }
                      </Text>

                      <Text
                        style={{
                          color: isDarkMode ? "#9ca3af" : "#6b7280",
                          fontWeight: 400,
                          fontSize: 12,
                          whiteSpace: "nowrap",
                          marginLeft: 8,
                          flexShrink: 0,
                        }}
                      >
                        {room?.messages?.length
                          ? formatShortTimeAgo(
                              new Date(
                                room?.messages[
                                  room?.messages.length - 1
                                ]?.createdAt
                              )
                            ) ?? ""
                          : ""}
                      </Text>
                    </div>

                    <Text
                      style={{
                        color: isDarkMode ? "#96989D" : "#65676b",
                        fontSize: 14,
                      }}
                    >
                      {room?.messages?.length
                        ? `${
                            room?.messages[room?.messages?.length - 1]?.user
                              ?.userName
                          }: `
                        : ""}
                      {room?.messages?.length
                        ? room?.messages[room?.messages?.length - 1]?.content ??
                          ""
                        : ""}
                    </Text>
                  </div>
                </div>
              </List.Item>
            )}
          />
        </div>
      </Layout.Sider>

      <Layout.Content
        style={{
          background: isDarkMode ? "rgb(0 0 0)" : "#ffffff",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {selectedChatRoom && (
          <>
            <div
              style={{
                padding: "12px 20px",
                borderBottom: `1px solid ${isDarkMode ? "#3F4147" : "#e4e6eb"}`,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Avatar
                size={36}
                src={otherParticipant?.avatarUrl}
                style={{
                  backgroundColor: "#3b82f6",
                  color: "#fff",
                  fontWeight: 600,
                }}
              >
                {otherParticipant?.userName?.[0]}
              </Avatar>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Text
                  style={{
                    fontWeight: 700,
                    color: isDarkMode ? "#fff" : "#111827",
                  }}
                >
                  {otherParticipant?.userName}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: isDarkMode ? "#9ca3af" : "#6b7280",
                  }}
                >
                  Online now
                </Text>
              </div>
            </div>

            <div
              ref={messagesContainerRef}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                overflowY: "auto",
                padding: "20px",
              }}
            >
              {messages?.map((message) => {
                const isOwn = message.senderId === currentUserId;
                const bubbleColor = isDarkMode
                  ? isOwn
                    ? "#1f3b8f"
                    : "#2a2e34"
                  : isOwn
                  ? "#3b82f6"
                  : "#f0f2f5";
                const textColor = isDarkMode
                  ? isOwn
                    ? "#ffffff"
                    : "#e5e7eb"
                  : isOwn
                  ? "#ffffff"
                  : "#111827";

                const attachments = (message as any)?.attachments ?? [];

                return (
                  <div
                    key={message.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      gap: 8,
                      justifyContent: isOwn ? "flex-end" : "flex-start",
                    }}
                  >
                    {!isOwn && message.user && (
                      <Avatar src={message.user.avatarUrl} size={32} />
                    )}

                    <div
                      style={{
                        maxWidth: 520,
                        background: bubbleColor,
                        color: textColor,
                        padding: "10px 14px",
                        borderRadius: 20,
                        boxShadow: isDarkMode
                          ? "0 1px 2px rgba(0,0,0,0.4)"
                          : "0 1px 2px rgba(0,0,0,0.08)",
                      }}
                    >
                      <p style={{ margin: 0, lineHeight: 1.5 }}>
                        {message.content}
                      </p>

                      {attachments?.length > 0 && (
                        <Space wrap style={{ marginTop: 8 }}>
                          {attachments.map((attachment: any) => (
                            <div key={attachment.id}>
                              {attachment.type === "video" ? (
                                <div style={{ width: 220 }}>
                                  <Plyr
                                    source={{
                                      type: "video",
                                      sources: [
                                        {
                                          src: attachment.url,
                                          type: "video/mp4",
                                        },
                                      ],
                                    }}
                                    options={{
                                      controls: ["play", "progress", "volume"],
                                    }}
                                  />
                                </div>
                              ) : (
                                <Image
                                  src={(attachment.url || "")
                                    .replace(/`/g, "")
                                    .trim()}
                                  alt="Message attachment"
                                  style={{
                                    maxWidth: 220,
                                    maxHeight: 220,
                                    objectFit: "cover",
                                    borderRadius: 12,
                                  }}
                                  preview={{ mask: null }}
                                />
                              )}
                            </div>
                          ))}
                        </Space>
                      )}

                      <Text
                        style={{
                          display: "block",
                          marginTop: 6,
                          fontSize: 12,
                          textAlign: isOwn ? "right" : "left",
                          color: isDarkMode ? "#9ca3af" : "#aaabacff",
                        }}
                      >
                        {convertToHumanTime(message?.createdAt ?? "")}
                      </Text>
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                padding: 16,
                borderTop: `1px solid ${isDarkMode ? "#3F4147" : "#e4e6eb"}`,
              }}
            >
              {fileList.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  {fileList.map((file) => {
                    const isImage = (file.type ?? "").startsWith("image/");
                    const isVideo = (file.type ?? "").startsWith("video/");
                    const blob =
                      (file as any).originFileObj ??
                      (file as unknown as Blob | undefined);
                    const src =
                      file.thumbUrl ??
                      (blob ? URL.createObjectURL(blob as Blob) : undefined);

                    return (
                      <div
                        key={file.uid}
                        style={{
                          position: "relative",
                          width: isVideo ? 180 : 120,
                          borderRadius: 12,
                          overflow: "hidden",
                        }}
                      >
                        {isImage && src ? (
                          <Image
                            src={src}
                            alt={file.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            preview={{ mask: null }}
                          />
                        ) : null}

                        {isVideo && src ? (
                          <video
                            src={src}
                            style={{ width: "100%", height: "100%" }}
                            controls
                          />
                        ) : null}

                        <Button
                          type="text"
                          icon={<CloseCircleOutlined />}
                          onClick={() => removePreviewFile(file)}
                          style={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            color: isDarkMode ? "#e5e7eb" : "#111827",
                            background: "transparent",
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              <Space.Compact style={{ width: "100%", gap: 8 }}>
                <Upload
                  fileList={fileList}
                  onChange={handleFileChange}
                  multiple
                  maxCount={5}
                  showUploadList={false}
                  beforeUpload={() => false}
                  accept="image/*,video/*"
                >
                  <Button type="text">
                    <PaperClipOutlined
                      style={{ color: isDarkMode ? "#B5BAC1" : "#65676b" }}
                    />
                  </Button>
                </Upload>

                <Input
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    borderRadius: 20,
                    background: isDarkMode ? "#1f1f1f" : "#f0f2f5",
                    border: `1px solid ${isDarkMode ? "#303030" : "#e4e6eb"}`,
                  }}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  disabled={!content.trim() && fileList.length === 0}
                  style={{
                    borderRadius: 12,
                  }}
                />
              </Space.Compact>
            </div>
          </>
        )}
      </Layout.Content>

      <Layout.Sider
        width={320}
        style={{
          background: isDarkMode ? "rgb(0 0 0)" : "#ffffff",
          height: "100%",
          overflowY: "auto",
          borderLeft: `1px solid ${isDarkMode ? "#3F4147" : "#e4e6eb"}`,
        }}
      >
        <div style={{ padding: 20 }}>
          <div style={{ marginTop: 16 }}>
            <Text
              style={{
                color: isDarkMode ? "#cbd5e1" : "#374151",
                fontWeight: 500,
                fontSize: 16,
              }}
            >
              Shared media ({sharedImages.length + sharedVideos.length})
            </Text>
            <div
              role="list"
              aria-label="Shared media"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 12,
                marginTop: 8,
              }}
            >
              {[...sharedImages, ...sharedVideos].slice(0, 6).map((m: any) => (
                <div
                  role="listitem"
                  key={m.id}
                  style={{
                    width: "100%",
                    paddingTop: "100%",
                    borderRadius: 12,
                    background:
                      "linear-gradient(135deg, rgba(59,130,246,0.35), rgba(16,185,129,0.35))",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {m.type === "image" ? (
                    <img
                      src={(m.url || "").replace(/`/g, "").trim()}
                      alt=""
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      loading="lazy"
                    />
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <Text
              style={{
                color: isDarkMode ? "#cbd5e1" : "#374151",
                fontWeight: 500,
                fontSize: 16,
              }}
            >
              Shared links ({sharedLinks.length})
            </Text>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                marginTop: 10,
              }}
            >
              {sharedLinks.map((href, i) => (
                <div
                  key={`${href}-${i}`}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                  }}
                >
                  <ExternalLink
                    size={18}
                    style={{
                      color: isDarkMode ? "#60a5fa" : "#2563eb",
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      minWidth: 0,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: 600,
                        color: isDarkMode ? "#e5e7eb" : "#111827",
                      }}
                    >
                      {getLinkTitle(href)}
                    </Text>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: isDarkMode ? "#9ca3af" : "#6b7280",
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "100%",
                      }}
                      title={href}
                    >
                      {href}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout.Sider>

      <Modal
        title={modalType === "DIRECT" ? "Select Contact" : "Create Channel"}
        open={contactsModalVisible}
        onCancel={() => setContactsModalVisible(false)}
        className={isDarkMode ? "dark-modal" : ""}
        style={{ top: "30%" }}
        footer={[
          <Button key="cancel" onClick={() => setContactsModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleCreateDirectChat}
            disabled={!selectedUser}
          >
            Start Conversation
          </Button>,
        ]}
      >
        {isLoadingContacts ? (
          <div style={{ color: isDarkMode ? "#fff" : "#000" }}>
            Loading contacts...
          </div>
        ) : (
          <Select
            value={selectedUser}
            onChange={(value) => {
              const selected = contactsQuery?.find(
                (contact: User) => contact.id === value
              );
              if (selected) setSelectedUser(selected.id);
            }}
            style={{ width: "100%" }}
            className={isDarkMode ? "dark-select" : ""}
            placeholder="Select a user to chat with"
            popupClassName={isDarkMode ? "dark-select-dropdown" : ""}
            optionFilterProp="children"
            notFoundContent="No contacts available"
            virtual={false}
            showSearch={false}
            onOpenChange={(open) => {
              if (open) {
                setTimeout(() => {
                  const event = new Event("resize");
                  window.dispatchEvent(event);
                }, 100);
              }
            }}
          >
            {contactsQuery?.map((contact: User) => (
              <Select.Option
                key={contact.id}
                value={contact.id}
                disabled={contact.id === userId}
              >
                {contact.userName}
              </Select.Option>
            ))}
          </Select>
        )}
      </Modal>
    </Layout>
  );
}

export default MessageApp;
