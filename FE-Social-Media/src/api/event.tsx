import { axiosClient } from "./axiosConfig";

export interface Event {
  id: string;
  name: string;
  description: string;
  eventAvatar?: string;
  eventDate: string;
  category: EventCategory;
  address?: string;
  createdAt: string;
  creator: {
    id: string;
    userName: string;
    avatarUrl?: string;
  };
  attendeesCount: number;
  activeAttendeesCount: number;
  attendees?: {
    userId: string;
    role: "ADMIN" | "ATTENDEE" | "PENDING_ATTENDEE";
    status: "ENROLL" | "CANCEL";
  }[];
}

export interface EventResponse {
  events: Event[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateEventDto {
  name: string;
  description: string;
  eventAvatar?: string;
  eventDate: string;
  category?: CreateEventCategory;
  address?: string;
}

export enum CreateEventCategory {
  MUSIC = "MUSIC",
  SPORTS = "SPORTS",
  EDUCATION = "EDUCATION",
  TECHNOLOGY = "TECHNOLOGY",
  FOOD = "FOOD",
  ART = "ART",
  BUSINESS = "BUSINESS",
  HEALTH = "HEALTH",
  OTHER = "OTHER",
}

export enum EventCategory {
  TRENDING = "TRENDING",
  MUSIC = "MUSIC",
  SPORTS = "SPORTS",
  EDUCATION = "EDUCATION",
  TECHNOLOGY = "TECHNOLOGY",
  FOOD = "FOOD",
  ART = "ART",
  BUSINESS = "BUSINESS",
  HEALTH = "HEALTH",
  OTHER = "OTHER",
}

interface EventAttendee {
  userId: string;
  role: "ADMIN" | "ATTENDEE" | "PENDING_ATTENDEE";
  status: "ENROLL" | "CANCEL";
  userName: string;
  avatarUrl: string;
}

interface EventCreator {
  id: string;
  userName: string;
  avatarUrl: string;
}

export interface EventDetail {
  id: string;
  name: string;
  description: string;
  eventAvatar: string | null;
  eventDate: string;
  category: EventCategory;
  address: string | null;
  createdAt: string;
  creator: EventCreator;
  attendees: EventAttendee[];
  attendeesCount: number;
  activeAttendeesCount: number;
}

interface JoinRequest {
  id: string;
  eventId: string;
  userId: string;
  role: "ADMIN" | "ATTENDEE" | "PENDING_ATTENDEE";
  status: "ENROLL" | "CANCEL";
  createAt: string;
  user: {
    id: string;
    userName: string;
    avatarUrl: string;
  };
}

interface JoinRequestsResponse {
  requests: JoinRequest[];
  count: number;
}

export const eventApi = {
  // User Layout
  createEvent: async (data: FormData) =>
    axiosClient.post("/events", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  getTrendingEvents: () =>
    axiosClient.get<{ events: Event[] }>("/events/trending/top"),

  joinEvent: (id: string) => axiosClient.post(`/events/${id}/join`),

  getEventsByCategory: (
    category: EventCategory,
    page: number = 1,
    limit: number = 10
  ) =>
    axiosClient.get<EventResponse>(
      `/events/category/${category}?page=${page}&limit=${limit}`
    ),

  getDiscoveryEvents: (page: number = 1, limit: number = 10) =>
    axiosClient.get<EventResponse>(
      `/events/all/discover?page=${page}&limit=${limit}`
    ),

  getMyEvents: (page: number = 1, limit: number = 10) =>
    axiosClient.get<EventResponse>(
      `/events/all/my-events?page=${page}&limit=${limit}`
    ),

  getEventById: (id: string) => {
    return axiosClient.get<EventDetail>(`/events/${id}`);
  },

  cancelAttendance: (id: string, cancelledUserId: string | undefined) =>
    axiosClient.post(`/events/${id}/cancel/${cancelledUserId}`),

  // Admin Layout
  getAllEvents: (page: number = 1, limit: number = 10) =>
    axiosClient.get<EventResponse>(`/events?page=${page}&limit=${limit}`),

  getEventAttendees: (id: string) => axiosClient.get(`/events/${id}/attendees`),
  getJoinRequests: (id: string) =>
    axiosClient.get<JoinRequestsResponse>(`/events/${id}/requests`),

  updateEvent: (id: string, data: Partial<CreateEventDto>) =>
    axiosClient.patch(`/events/${id}`, data),

  approveRequest: (eventId: string, userId: string) =>
    axiosClient.post(`/events/${eventId}/approve/${userId}`),

  deleteEvent: (id: string) => axiosClient.delete(`/events/${id}`),
};
