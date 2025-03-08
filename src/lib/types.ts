export interface User {
  id: string;
  username: string;
  joinedAt: string;
  followers: string[];
  following: string[];
  postCount: number;
}

export enum PostType {
  REGULAR = "regular",
  REPOST = "repost",
  QUOTE = "quote",
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
}

export interface CreatePostData {
  content: string;
  authorId: string;
  type: PostType;
  originalPostId?: string;
}
