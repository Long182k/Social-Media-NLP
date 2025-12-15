import { gql } from "@apollo/client";
import { NOTIFICATION_FRAGMENT } from "./notifications";

export const POST_FRAGMENT = gql`
  fragment PostFields on Post {
    id
    content
    userId
    sentiment
    createdAt
    user {
      id
      userName
      avatarUrl
    }
    attachments {
      id
      type
      url
    }
    _count {
      likes
      comments
      bookmarks
    }
  }
`;

// Queries
export const GET_POSTS = gql`
  query GetPosts($page: Int, $limit: Int) {
    posts(pagination: { page: $page, limit: $limit }) {
      data {
        ...PostFields
      }
      meta {
        total
        page
        limit
        totalPages
      }
    }
  }
  ${POST_FRAGMENT}
`;

export const GET_POST = gql`
  query GetPost($id: ID!) {
    post(id: $id) {
      ...PostFields
    }
  }
  ${POST_FRAGMENT}
`;

// Mutations
export const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      ...PostFields
    }
  }
  ${POST_FRAGMENT}
`;

export const UPDATE_POST = gql`
  mutation UpdatePost($id: ID!, $input: UpdatePostInput!) {
    updatePost(id: $id, input: $input) {
      ...PostFields
    }
  }
  ${POST_FRAGMENT}
`;

export const DELETE_POST = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id)
  }
`;

export const LIKE_POST = gql`
  mutation LikePost($id: ID!) {
    likePost(id: $id) {
      liked
    }
  }
`;

// Subscriptions
export const POST_CREATED_SUBSCRIPTION = gql`
  subscription OnPostCreated {
    postCreated {
      ...PostFields
    }
  }
  ${POST_FRAGMENT}
`;
export const POST_LIKED_SUBSCRIPTION = gql`
  subscription OnPostLiked {
    postLiked {
      ...NotificationFields
    }
  }
  ${NOTIFICATION_FRAGMENT}
`;
