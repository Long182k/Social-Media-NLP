export interface User {
  id: string;
  userName: string;
  avatarUrl: string | null;
}

export interface Attachment {
  id: string;
  type: string;
  url: string;
}

export interface PostCount {
  likes: number;
  comments: number;
  bookmarks: number;
}

export interface Post {
  id: string;
  content: string;
  userId: string;
  sentiment: string | null;
  createdAt: string;
  user: User;
  attachments: Attachment[];
  _count: PostCount;
}

export interface PostLikeResponse {
  id: string;
  content: string;
  type: string;
  senderId: string;
  receiverId: string;
}

export interface PostMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PostsData {
  posts: {
    data: Post[];
    meta: PostMeta;
  };
}

export interface CreatePostData {
  createPost: Post;
}

export interface CreatePostInput {
  content: string;
  attachments?: File[];
}

export interface UpdatePostData {
  updatePost: Post;
}

export interface DeletePostData {
  deletePost: boolean;
}

export interface LikePostData {
  likePost: {
    liked: boolean;
  };
}

export interface PostCreatedData {
  postCreated: Post;
}

export interface PostLikedData {
  postLiked: {
    postId: string;
    userId: string;
    liked: boolean;
  };
}
