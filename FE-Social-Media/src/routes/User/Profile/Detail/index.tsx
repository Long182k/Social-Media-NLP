import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as Tabs from "@radix-ui/react-tabs";
import { Card } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { User, UserDetail } from "../../../../@util/types/auth.type";
import { getFollowers, getFollowing } from "../../../../api/auth";
import CenterContent from "../../../../containers/CenterLayout/CenterContent";
import { useAppStore } from "../../../../store";
import { Image } from "antd";
import { Attachment } from "../../../../@util/interface/post.interface";
import Plyr from "plyr-react";

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface DetailPageComponentProps {
  userDetail: UserDetail;
  isDarkMode: boolean;
}

function DetailPageComponent({
  userDetail,
  isDarkMode,
}: DetailPageComponentProps) {
  const [activeTab, setActiveTab] = useState("posts");
  const [searchTerm, setSearchTerm] = useState("");
  const { userInfo } = useAppStore();
  const userId = userInfo?.userId || "";

  const ownPosts = Array.isArray(userDetail?.posts)
    ? userDetail.posts.filter((post) => post?.userId === userId)
    : [];

  const ownImages: Attachment[] = ownPosts
    .filter((post) => post?.attachments?.length)
    .flatMap((post) =>
      (post.attachments || []).filter((item) => item?.type === "image")
    );

  const ownVideos: Attachment[] = ownPosts
    .filter((post) => post?.attachments?.length)
    .flatMap((post) =>
      (post.attachments || []).filter((item) => item?.type === "video")
    );

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Fetch following users
  const { data: followingData } = useQuery<PaginatedResponse<User>>({
    queryKey: ["following", userId],
    queryFn: () => getFollowing(1, 100),
    enabled: !!userId && activeTab === "following",
  });

  // Fetch followers
  const { data: followersData } = useQuery<PaginatedResponse<User>>({
    queryKey: ["followers", userId],
    queryFn: () => getFollowers(1, 100),
    enabled: !!userId && activeTab === "followers",
  });

  const filteredFollowing =
    (Array.isArray(followingData?.data) ? followingData.data : (Array.isArray(followingData) ? (followingData as any) : [])).filter(
      (user: any) =>
        user?.userName?.toLowerCase?.()?.includes(searchTerm.toLowerCase()) ||
        user?.nickName?.toLowerCase?.()?.includes(searchTerm.toLowerCase())
    );

  const filteredFollowers =
    (Array.isArray(followersData?.data) ? followersData.data : (Array.isArray(followersData) ? (followersData as any) : [])).filter(
      (user: any) =>
        user?.userName?.toLowerCase?.()?.includes(searchTerm.toLowerCase()) ||
        user?.nickName?.toLowerCase?.()?.includes(searchTerm.toLowerCase())
    );

  const renderPhotoCards = (ownImages: Attachment[]) => {
    {
      return ownImages?.length ? (
        <div
          role="list"
          aria-label="Recent photos"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
          }}
        >
          {Array.isArray(ownImages)
            ? ownImages
                .flat()
                .filter((m) => m?.type === "image" && m?.url)
                .map((m) => (
                  <Image
                    src={m.url}
                    key={m.id}
                    style={{
                      width: "100%",
                      objectFit: "cover",
                      borderRadius: 12,
                      display: "block",
                    }}
                  />
                ))
            : null}
        </div>
      ) : (
        <div> No photos available.</div>
      );
    }
  };

  const renderVideoCards = (ownVideos: Attachment[]) => {
    {
      return ownVideos?.length ? (
        <div
          role="list"
          aria-label="Recent videos"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
          }}
        >
          {Array.isArray(ownVideos)
            ? ownVideos
                .flat()
                .filter((m) => m?.type === "video" && m?.url)
                .map((m) => (
                  <Plyr
                    source={{
                      type: "video",
                      sources: [
                        {
                          src: m.url,
                          type: "video/mp4",
                        },
                      ],
                    }}
                    options={{
                      controls: [
                        "play",
                        "progress",
                        "current-time",
                        "mute",
                        "volume",
                        "fullscreen",
                      ],
                      ratio: "16:9",
                    }}
                  />
                ))
            : null}
        </div>
      ) : (
        <div style={{ padding: 12 }}>No videos available.</div>
      );
    }
  };

  const renderUserCards = (users: User[]) => {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 20,
          marginTop: 20,
        }}
      >
        {users.map((user) => (
          <article
            key={user.id}
            aria-label={`${user.userName} card`}
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              border: isDarkMode ? "1px solid #303030" : "1px solid #e8e8e8",
              background: isDarkMode ? "#1a1a1a" : "#fff",
              padding: 16,
              textAlign: "center",
            }}
          >
            <AvatarPrimitive.Root
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                margin: "0 auto 10px",
                overflow: "hidden",
                background: isDarkMode ? "#2a2a2a" : "#f3f4f6",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AvatarPrimitive.Image
                src={user.avatarUrl || ""}
                alt={`${user.userName} avatar`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <AvatarPrimitive.Fallback
                delayMs={200}
                style={{
                  color: isDarkMode ? "#e5e7eb" : "#374151",
                  fontWeight: 600,
                }}
              >
                {user.userName?.[0]?.toUpperCase() || "U"}
              </AvatarPrimitive.Fallback>
            </AvatarPrimitive.Root>

            <h4 style={{ marginBottom: 4 }}>{user.userName}</h4>
            <p style={{ color: "#888", minHeight: 24 }}>
              {user.bio || "No bio"}
            </p>
          </article>
        ))}
      </div>
    );
  };

  const barStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    alignItems: "stretch",
    gap: 0,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    background: isDarkMode ? "#1f1f1f" : "#f3f5f7",
    border: isDarkMode ? "1px solid #303030" : "1px solid #e8e8e8",
  } as const;

  const triggerBaseStyle = {
    width: "100%",
    height: 40,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
    cursor: "pointer",
    outline: "none",
    border: "none",
  } as const;

  const triggerInactiveStyle = {
    background: "transparent",
    color: isDarkMode ? "#bfbfbf" : "#6b7280",
  } as const;

  const triggerActiveStyle = {
    background: isDarkMode ? "#2a2a2a" : "#ffffff",
    color: isDarkMode ? "#ffffff" : "#111827",
    boxShadow: isDarkMode
      ? "0 1px 0 rgba(255,255,255,0.05), 0 1px 3px rgba(0,0,0,0.4)"
      : "0 1px 0 rgba(0,0,0,0.02), 0 1px 3px rgba(0,0,0,0.06)",
    border: isDarkMode ? "1px solid #3a3a3a" : "1px solid #e8e8e8",
  } as const;

  const tStyle = (value: string) => ({
    ...triggerBaseStyle,
    ...(activeTab === value ? triggerActiveStyle : triggerInactiveStyle),
  });

  return (
    <div>
      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List aria-label="Profile tabs" style={barStyle}>
          <Tabs.Trigger value="posts" style={tStyle("posts")}>
            Posts
          </Tabs.Trigger>
          <Tabs.Trigger value="photos" style={tStyle("photos")}>
            Photos
          </Tabs.Trigger>
          <Tabs.Trigger value="videos" style={tStyle("videos")}>
            Videos
          </Tabs.Trigger>
          <Tabs.Trigger value="following" style={tStyle("following")}>
            Following
          </Tabs.Trigger>
          <Tabs.Trigger value="followers" style={tStyle("followers")}>
            Followers
          </Tabs.Trigger>
        </Tabs.List>

        {/* Below Tabs: two-column layout (left fixed, right tab content) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "300px 1fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* LEFT COLUMN: Basic info + Photos (persistent) */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <section
              aria-labelledby="basic-info-title"
              style={{
                borderRadius: 8,
                backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff",
                border: isDarkMode ? "1px solid #303030" : "1px solid #e8e8e8",
                padding: 16,
              }}
            >
              <h2
                id="basic-info-title"
                style={{
                  margin: 0,
                  marginBottom: 16,
                  fontSize: 18,
                  color: isDarkMode ? "#ffffff" : "#111827",
                }}
              >
                Basic info
              </h2>

              {/* Re-implemented with Radix Card components */}
              <div
                role="list"
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <Card
                  role="listitem"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 10,
                    borderRadius: 10,
                    backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff",
                  }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: isDarkMode ? "#2a2a2a" : "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ color: isDarkMode ? "#bfbfbf" : "#555555" }}>
                      📧
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ color: isDarkMode ? "#ffffff" : "#000000" }}>
                      Email
                    </span>
                    <span style={{ color: isDarkMode ? "#bfbfbf" : "#6b7280" }}>
                      {userDetail?.email || "Not specified"}
                    </span>
                  </div>
                </Card>

                <Card
                  role="listitem"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 10,
                    borderRadius: 10,
                    backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff",
                  }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: isDarkMode ? "#2a2a2a" : "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ color: isDarkMode ? "#bfbfbf" : "#555555" }}>
                      🎂
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ color: isDarkMode ? "#ffffff" : "#000000" }}>
                      Date of birth
                    </span>
                    <span style={{ color: isDarkMode ? "#bfbfbf" : "#6b7280" }}>
                      {formatDate(userDetail?.dateOfBirth || "")}
                    </span>
                  </div>
                </Card>

                <Card
                  role="listitem"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 10,
                    borderRadius: 10,
                    backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff",
                  }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: isDarkMode ? "#2a2a2a" : "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ color: isDarkMode ? "#bfbfbf" : "#555555" }}>
                      📝
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ color: isDarkMode ? "#ffffff" : "#000000" }}>
                      Bio
                    </span>
                    <span style={{ color: isDarkMode ? "#bfbfbf" : "#6b7280" }}>
                      {userDetail?.bio || "Not specified"}
                    </span>
                  </div>
                </Card>
              </div>
            </section>

            <section
              aria-labelledby="photos-title"
              style={{
                borderRadius: 8,
                backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff",
                border: isDarkMode ? "1px solid #303030" : "1px solid #e8e8e8",
                padding: 16,
              }}
            >
              <h2
                id="photos-title"
                style={{
                  margin: 0,
                  marginBottom: 16,
                  fontSize: 18,
                  color: isDarkMode ? "#ffffff" : "#111827",
                }}
              >
                Photos
              </h2>

              <div
                role="list"
                aria-label="Recent photos"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 16,
                }}
              >
                {Array.isArray(ownImages)
                  ? ownImages
                      .flat()
                      .filter((m) => m?.type === "image" && m?.url)
                      .map((m) => (
                        <Image
                          src={m.url}
                          key={m.id}
                          style={{
                            width: "100%",
                            height: 72,
                            objectFit: "cover",
                            borderRadius: 12,
                            display: "block",
                          }}
                        />
                      ))
                  : null}
              </div>
            </section>
          </aside>

          {/* RIGHT COLUMN: tab content */}
          <main style={{ display: "flex", flexDirection: "column" }}>
            {["followers", "following"].includes(activeTab) && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginBottom: 20,
                  maxWidth: "100%",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    width: 300,
                  }}
                >
                  <input
                    id="connectionSearch"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search connections..."
                    aria-label="Search connections"
                    style={{
                      width: "100%",
                      height: 36,
                      padding: "0 36px 0 12px",
                      borderRadius: 12,
                      border: isDarkMode
                        ? "1px solid #303030"
                        : "1px solid #e5e7eb",
                      backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff",
                      color: isDarkMode ? "#e5e7eb" : "#111827",
                    }}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      aria-label="Clear search"
                      style={{
                        position: "absolute",
                        right: 8,
                        background: "transparent",
                        border: "none",
                        color: isDarkMode ? "#bfbfbf" : "#6b7280",
                        cursor: "pointer",
                        padding: 4,
                        borderRadius: 6,
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            )}

            <Tabs.Content value="posts">
              <CenterContent
                currentUserId={userDetail?.id}
                userAvatar={userDetail?.avatarUrl}
                ownPosts={ownPosts}
                isFromProfile={true}
                isDarkMode={isDarkMode}
              />
            </Tabs.Content>

            <Tabs.Content value="following">
              {renderUserCards(filteredFollowing)}
            </Tabs.Content>

            <Tabs.Content value="photos">
              {renderPhotoCards(ownImages)}
            </Tabs.Content>

            <Tabs.Content value="videos">
              {renderVideoCards(ownVideos)}
            </Tabs.Content>

            <Tabs.Content value="followers">
              {renderUserCards(filteredFollowers)}
            </Tabs.Content>
          </main>
        </div>
      </Tabs.Root>
    </div>
  );
}

export default DetailPageComponent;
