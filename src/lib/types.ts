export interface User {
  id: string;
  username: string;
  joinedAt: string;
  followers: string[]; // Array of user IDs
  following: string[]; // Array of user IDs
  postCount: number;
}

export enum PostType {
  REGULAR = "regular",
  REPOST = "repost",
  QUOTE = "quote",
  REPLY = "reply",
}

export interface Post {
  id: string;
  content: string;
  authorId: string;
  author: User;
  createdAt: string;
  type: PostType;
  originalPostId?: string;
  originalPost?: Post;
  replyToId?: string;
  replyTo?: Post;
}

export interface CreatePostData {
  content: string;
  authorId: string;
  type: PostType;
  originalPostId?: string;
  replyToId?: string;
}
