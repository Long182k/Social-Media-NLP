import axios from "axios";
import { LoginParams, RegisterNewUserParams } from "../@util/types/auth.type";
import { axiosClient } from "./axiosConfig";

const API_URL = import.meta.env.VITE_SERVER_URL;

const initialAxiosClient = axios.create({ baseURL: API_URL });

export const registerNewUser = (data: RegisterNewUserParams) =>
  initialAxiosClient.post(`/auth/register`, data);

export const loginUser = (data: LoginParams) => {
  return initialAxiosClient.post(`/auth/login`, data);
};

export const updateProfile = async (data: {
  nickName?: string;
  bio?: string;
  dateOfBirth?: string;
}) => {
  const response = await axiosClient.patch("/users/edit-profile", data);
  return response.data;
};

export const updateAvatar = async (formData: FormData) => {
  const response = await axiosClient.patch("/users/change/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updateCoverPage = async (formData: FormData) => {
  const response = await axiosClient.patch(
    "/users/change/cover-page",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const followUser = async (userId: string) => {
  const response = await axiosClient.post(`/users/follow/${userId}`);
  return response.data;
};

export const getFollowStatus = async (userId: string) => {
  const response = await axiosClient.get(`/users/follow-status/${userId}`);
  return response.data;
};

export const getUserById = async (id: string) => {
  const response = await axiosClient.get(`/auth/profile/${id}`);
  return response.data;
};

export const getFollowers = async (
  page: number,
  limit: number
) => {
  const response = await axiosClient.get(
    `/users/followers/?page=${page}&limit=${limit}`
  );
  return response.data;
};

export const getFollowing = async (
  page: number,
  limit: number
) => {
  const response = await axiosClient.get(
    `/users/following/?page=${page}&limit=${limit}`
  );
  return response.data;
};

export const getRecentBirthday = async (page: number, limit: number) => {
  const response = await axiosClient.get(
    `/users/recent_birthday?page=${page}&limit=${limit}`
  );
  return response.data;
};

export const getSuggestedUsers = async (page: number, limit: number) => {
  const response = await axiosClient.get(
    `/users/suggestions?page=${page}&limit=${limit}`
  );
  return response.data;
};

export const changePassword = async (data: {
  oldPassword: string;
  newPassword: string;
}) => {
  const response = await axiosClient.post("/auth/change-password", data);
  return response.data;
};

export const forgotPassword = async (email: string) => {
  const response = await axiosClient.post("/auth/forgot-password", { email });
  return response.data;
};
