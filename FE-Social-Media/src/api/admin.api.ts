import { DashboardStats, EventManagementData, GroupManagementData, UserManagementData } from "../@util/interface/admin.interface";
import { axiosClient } from "./axiosConfig";

const adminApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await axiosClient.get(`/admin/dashboard-stats`);
    return response.data;
  },

  getUserManagementData: async (
    page: number,
    pageSize: number
  ): Promise<UserManagementData> => {
    const response = await axiosClient.get(`/admin/users`, {
      params: { page, pageSize },
    });
    return response.data;
  },

  toggleUserActivity: async (userId: string) => {
    const response = await axiosClient.patch(
      `/admin/users/${userId}/toggle-activity`
    );
    return response.data;
  },

  getGroupManagementData: async (
    page: number,
    pageSize: number
  ): Promise<GroupManagementData> => {
    const response = await axiosClient.get(`/admin/groups`, {
      params: { page, pageSize },
    });
    return response.data;
  },

  deleteGroup: async (groupId: string) => {
    const response = await axiosClient.delete(`/admin/groups/${groupId}`);
    return response.data;
  },

  getEventManagementData: async (
    page: number,
    pageSize: number
  ): Promise<EventManagementData> => {
    const response = await axiosClient.get(`/admin/events`, {
      params: { page, pageSize },
    });
    return response.data;
  },

  deleteEvent: async (eventId: string) => {
    const response = await axiosClient.delete(`/admin/events/${eventId}`);
    return response.data;
  },
};

export default adminApi;
