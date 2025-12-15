import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Layout, List, Spin } from "antd";
import { RcFile } from "antd/es/upload";
import { useState } from "react";
import { toast } from "react-toastify";
import {
  Post,
  UpdatePostDto,
  CreatePostDto,
} from "../../@util/types/post.type";
import { postApi } from "../../api/post";
import CreatePostForm from "../../components/posts/CreatePostForm";
import PostItem from "../../components/posts/Detail/PostItem";
import EditPostModal from "../../components/posts/EditPostModal";

const { Content } = Layout;

interface CenterContentProps {
  isDarkMode: boolean;
  currentUserId: string;
  userAvatar?: string;
  isFromProfile?: boolean;
  isFromBookmark?: boolean;
  ownPosts?: Post[];
}

const CenterContent = ({
  isDarkMode,
  currentUserId,
  userAvatar,
  isFromProfile,
  isFromBookmark,
  ownPosts,
}: CenterContentProps) => {
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const queryClient = useQueryClient();

  const {
    data: postsQuery,
    refetch: refetchPosts,
    isLoading: isLoadingPosts,
    isError: isErrorPosts,
  } = useQuery({
    queryKey: ["posts"],
    select: (data) => data.data,
    queryFn: () => postApi.getPosts(),
  });

  // Mutations
  const createPostMutation = useMutation({
    mutationFn: postApi.createPost,
    onSuccess: () => {
      refetchPosts();
      toast.success("Post created successfully!");
    },
  });

  const handleCreatePost = (values: CreatePostDto, files?: RcFile[]): void => {
    const formData = new FormData();
    formData.append("content", values.content);

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("files", file);
      });
    }

    createPostMutation.mutate(formData);
  };

  const updatePostMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePostDto }) =>
      postApi.updatePost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post updated successfully!");
    },
  });

  const handleEditPost = async (
    id: string,
    data: UpdatePostDto
  ): Promise<void> => {
    try {
      await updatePostMutation.mutateAsync({ id, data });
      setEditingPost(null);
    } catch (error) {
      toast.error("Failed to update post");
    }
  };

  return (
    <Content>
      {/* <StoryList isDarkMode={isDarkMode} /> */}

      {!isFromBookmark && (
        <CreatePostForm
          onSubmit={handleCreatePost}
          isDarkMode={isDarkMode}
          userAvatar={userAvatar}
        />
      )}

      {isLoadingPosts ? (
        <Spin size="large" />
      ) : isErrorPosts ? (
        <Alert type="error" message="Error loading posts" />
      ) : (
        <List
          size="large"
          dataSource={isFromProfile ? ownPosts : postsQuery?.data}
          renderItem={(post: Post) => (
            <PostItem
              post={post}
              currentUserId={currentUserId}
              isDarkMode={isDarkMode}
              refetchPosts={refetchPosts}
              isLoadingPosts={isLoadingPosts}
              onEdit={(post) => setEditingPost(post)}
            />
          )}
        />
      )}

      <EditPostModal
        post={editingPost}
        isOpen={!!editingPost}
        onClose={() => setEditingPost(null)}
        onSubmit={handleEditPost}
        isDarkMode={isDarkMode}
      />
    </Content>
  );
};

export default CenterContent;
