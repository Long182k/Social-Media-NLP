import {
  CreatePostDto,
  Post,
  PostInteractionResponse,
  PostResponse,
  UpdatePostDto,
  ApiResponse
} from "../@util/types/post.type";
import { axiosClient } from "./axiosConfig";

export const postApi = {
  createPost: (data: CreatePostDto | FormData) =>
    axiosClient.post<ApiResponse<Post>>("/posts", data, {
      headers: {
        "Content-Type":
          data instanceof FormData ? "multipart/form-data" : "application/json",
      },
    }),

  getPosts: () => axiosClient.get<PostResponse>("/posts"),

  getPost: (id: string) => axiosClient.get<ApiResponse<Post>>(`/posts/${id}`),

  updatePost: (id: string, data: UpdatePostDto) =>
    axiosClient.patch<ApiResponse<Post>>(`/posts/${id}`, data),

  deletePost: (id: string) => axiosClient.delete(`/posts/${id}`),

  likePost: (id: string) =>
    axiosClient.post<PostInteractionResponse>(`/posts/${id}/like`),

  commentPost: (postId: string, formData: FormData) =>
    axiosClient.post(`/posts/${postId}/comment`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};
