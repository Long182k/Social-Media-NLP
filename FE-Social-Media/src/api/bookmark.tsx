import { BookmarkResponse } from "../@util/types/bookmark.type";
import { axiosClient } from "./axiosConfig";

export const bookmarkApi = {
  bookmarkPost: (id: string) => axiosClient.post(`/bookmark/${id}`),

  getBookmarks: () => axiosClient.get<BookmarkResponse>("/bookmark"),

  deleteBookmark: (id: string) => {
    return axiosClient.delete(`/bookmark/${id}`);
  },
};
