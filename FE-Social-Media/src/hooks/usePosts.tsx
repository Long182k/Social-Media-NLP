import { useMutation, useSubscription } from "@apollo/client/react";

import { gql } from "@apollo/client";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import {
  CreatePostData,
  CreatePostInput,
  DeletePostData,
  LikePostData,
  Post,
  PostCount,
  PostCreatedData,
  PostLikeResponse,
  PostsData,
  UpdatePostData,
} from "../@util/interface/post.interface";
import {
  CREATE_POST,
  DELETE_POST,
  GET_POSTS,
  LIKE_POST,
  POST_CREATED_SUBSCRIPTION,
  POST_LIKED_SUBSCRIPTION,
  UPDATE_POST,
} from "../api/graphql/posts";
import { useAppStore } from "../store";

export const usePosts = (page = 1, limit = 10) => {
  const queryClient = useQueryClient();
  const currentUserId = useAppStore.getState().userInfo.userId;

  // Clean up old notification flags from sessionStorage
  useEffect(() => {
    const cleanupNotificationFlags = () => {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith("notification_shown_")) {
          if (Math.random() < 0.1) {
            // 10% chance to clean up on each hook call
            sessionStorage.removeItem(key);
          }
        }
      }
    };

    cleanupNotificationFlags();
  }, []);

  // Query to fetch posts
  // const { data, loading, error, refetch } = useQuery<PostsData>(GET_POSTS, {
  //   variables: { page, limit },
  //   fetchPolicy: "cache-and-network",
  // });

  // Mutation to create a post with optimistic UI
  const [createPost] = useMutation<CreatePostData, { input: CreatePostInput }>(
    CREATE_POST,
    {
      update: (cache, { data }) => {
        if (!data) return;

        const existingPosts = cache.readQuery<PostsData>({
          query: GET_POSTS,
          variables: { page, limit },
        });

        if (existingPosts) {
          cache.writeQuery({
            query: GET_POSTS,
            variables: { page, limit },
            data: {
              posts: {
                ...existingPosts.posts,
                data: [data.createPost, ...existingPosts.posts.data],
              },
            },
          });
        }
      },
    }
  );

  // Mutation to update a post
  const [updatePost] = useMutation<UpdatePostData>(UPDATE_POST);

  // Mutation to delete a post
  const [deletePost] = useMutation<DeletePostData, { id: string }>(
    DELETE_POST,
    {
      update: (cache, { data }, { variables }) => {
        if (data?.deletePost && variables) {
          const existingPosts = cache.readQuery<PostsData>({
            query: GET_POSTS,
            variables: { page, limit },
          });

          if (existingPosts) {
            cache.writeQuery({
              query: GET_POSTS,
              variables: { page, limit },
              data: {
                posts: {
                  ...existingPosts.posts,
                  data: existingPosts.posts.data.filter(
                    (post: Post) => post.id !== variables.id
                  ),
                },
              },
            });
          }
        }
      },
    }
  );

  // Mutation to like a post with optimistic UI
  const [likePost] = useMutation<LikePostData, { id: string }>(LIKE_POST, {
    optimisticResponse: () => ({
      likePost: {
        __typename: "PostInteractionResponse",
        liked: true,
      },
    }),
    update: (cache, { data }, { variables }) => {
      if (!data || !variables) return;
      const postId = variables.id;
      const existingPost = cache.readFragment<{ _count: PostCount }>({
        id: `Post:${postId}`,
        fragment: gql`
          fragment ExistingPost on Post {
            id
            _count {
              likes
            }
          }
        `,
      });
      if (existingPost) {
        cache.writeFragment({
          id: `Post:${postId}`,
          fragment: gql`
            fragment UpdatedPost on Post {
              _count {
                likes
              }
            }
          `,
          data: {
            _count: {
              ...existingPost._count,
              likes: data.likePost.liked
                ? existingPost._count.likes + 1
                : Math.max(0, existingPost._count.likes - 1),
            },
          },
        });
      }
    },
  });

  // Subscribe to new posts
  useSubscription<PostCreatedData>(POST_CREATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (data?.data?.postCreated) {
        // The cache will be automatically updated by Apollo
        console.log("New post received:", data.data.postCreated);
      }
    },
  });

  // Subscribe to post likes
  useSubscription<{ postLiked: PostLikeResponse }>(POST_LIKED_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (data?.data?.postLiked) {
        // The cache will be automatically updated by Apollo
        const notificationId = data.data.postLiked.id;
        const hasBeenShown = sessionStorage.getItem(
          `notification_shown_${notificationId}`
        );

        if (!hasBeenShown) {
          // Mark this notification as shown
          sessionStorage.setItem(
            `notification_shown_${notificationId}`,
            "true"
          );
          // Show the toast
          if (data.data.postLiked.receiverId !== data.data.postLiked.senderId) {
            toast.success(data.data.postLiked.content);
            queryClient.invalidateQueries({ queryKey: ["posts"] });
          }
        }
      }
    },
  });

  // Helper function to handle post creation
  const handleCreatePost = useCallback(
    async (content: string, attachments: File[] = []) => {
      try {
        const result = await createPost({
          variables: {
            input: {
              content,
              attachments,
            },
          },
        });
        return result.data?.createPost;
      } catch (error) {
        console.error("Error creating post:", error);
        throw error;
      }
    },
    [createPost]
  );

  // Helper function to handle post like
  const handleLikePost = useCallback(
    async (id: string) => {
      try {
        const result = await likePost({
          variables: { id },
        });
        queryClient.invalidateQueries({ queryKey: ["posts"] });
        return result.data?.likePost;
      } catch (error) {
        console.error("Error liking post:", error);
        throw error;
      }
    },
    [likePost, queryClient]
  );

  return {
    // posts: data?.posts?.data || [],
    // meta: data?.posts?.meta,
    // loading,
    // error,
    // refetch,
    createPost: handleCreatePost,
    updatePost,
    deletePost,
    likePost: handleLikePost,
  };
};
