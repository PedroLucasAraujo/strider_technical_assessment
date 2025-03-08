// src/api/posts.ts
import { v4 as uuidv4 } from "uuid";
import { Post, CreatePostData, PostType } from "../@types/index";
import { users, getUserById, getUserByUsername } from "./users";

let posts: Post[] = [
  {
    id: "1",
    content: "Hello world! This is my first post on Posterr.",
    authorId: "1",
    author: users[0],
    createdAt: "2023-06-15T10:30:00Z",
    type: PostType.REGULAR,
  },
  {
    id: "2",
    content: "Just joined Posterr! Excited to connect with everyone.",
    authorId: "2",
    author: users[1],
    createdAt: "2023-06-16T14:20:00Z",
    type: PostType.REGULAR,
  },
  {
    id: "3",
    content: "",
    authorId: "1",
    author: users[0],
    createdAt: "2023-06-17T09:15:00Z",
    type: PostType.REPOST,
    originalPostId: "2",
    originalPost: {
      id: "2",
      content: "Just joined Posterr! Excited to connect with everyone.",
      authorId: "2",
      author: users[1],
      createdAt: "2023-06-16T14:20:00Z",
      type: PostType.REGULAR,
    },
  },
  {
    id: "4",
    content: "This is a great post! Welcome to Posterr!",
    authorId: "3",
    author: users[2],
    createdAt: "2023-06-18T16:45:00Z",
    type: PostType.QUOTE,
    originalPostId: "2",
    originalPost: {
      id: "2",
      content: "Just joined Posterr! Excited to connect with everyone.",
      authorId: "2",
      author: users[1],
      createdAt: "2023-06-16T14:20:00Z",
      type: PostType.REGULAR,
    },
  },
  {
    id: "5",
    content: "Learning about Redux and state management today!",
    authorId: "1",
    author: users[0],
    createdAt: "2023-06-19T11:30:00Z",
    type: PostType.REGULAR,
  },
  {
    id: "6",
    content: "Implementing search functionality in my app",
    authorId: "2",
    author: users[1],
    createdAt: "2023-06-20T09:45:00Z",
    type: PostType.REGULAR,
  },
  {
    id: "7",
    content: "Glassmorphism is a cool UI trend",
    authorId: "3",
    author: users[2],
    createdAt: "2023-06-21T14:20:00Z",
    type: PostType.REGULAR,
  },
];

export const getPosts = (userIds?: string[], username?: string): Post[] => {
  let filteredPosts = [...posts];

  if (userIds && userIds.length > 0) {
    filteredPosts = filteredPosts.filter((post) =>
      userIds.includes(post.authorId)
    );
  }

  if (username) {
    const user = getUserByUsername(username);
    if (user) {
      filteredPosts = filteredPosts.filter((post) => post.authorId === user.id);
    } else {
      return [];
    }
  }

  return filteredPosts.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const searchPosts = (query: string): Post[] => {
  if (!query.trim()) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();

  return posts
    .filter((post) => {
      if (post.type === PostType.REPOST) {
        return false;
      }

      if (post.type === PostType.REGULAR) {
        return post.content.toLowerCase().includes(normalizedQuery);
      }

      if (post.type === PostType.QUOTE) {
        return post.content.toLowerCase().includes(normalizedQuery);
      }

      return false;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
};

export const createPost = (data: CreatePostData): Post => {
  const { content, authorId, type, originalPostId } = data;

  const author = getUserById(authorId);
  if (!author) {
    throw new Error("User not found");
  }

  const today = new Date();
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ).toISOString();

  const postsToday = posts.filter(
    (post) =>
      post.authorId === authorId &&
      new Date(post.createdAt) >= new Date(startOfDay)
  );

  if (postsToday.length >= 5) {
    throw new Error("You have reached the daily limit of 5 posts");
  }

  if (content.length > 777) {
    throw new Error("Post cannot exceed 777 characters");
  }

  let originalPost: Post | undefined;
  if (type !== PostType.REGULAR) {
    if (!originalPostId) {
      throw new Error(
        "Original post ID is required for reposts and quote posts"
      );
    }

    originalPost = posts.find((post) => post.id === originalPostId);
    if (!originalPost) {
      throw new Error("Original post not found");
    }
  }

  const newPost: Post = {
    id: uuidv4(),
    content,
    authorId,
    author,
    createdAt: new Date().toISOString(),
    type,
    originalPostId,
    originalPost,
  };

  posts = [newPost, ...posts];

  const userIndex = users.findIndex((user) => user.id === authorId);
  if (userIndex !== -1) {
    users[userIndex] = {
      ...users[userIndex],
      postCount: users[userIndex].postCount + 1,
    };
  }

  return newPost;
};

export const followUser = (followerId: string, followeeId: string): void => {
  const follower = getUserById(followerId);
  const followee = getUserById(followeeId);

  if (!follower || !followee) {
    throw new Error("User not found");
  }

  if (followerId === followeeId) {
    throw new Error("You cannot follow yourself");
  }

  if (follower.following.includes(followeeId)) {
    return;
  }

  const followerIndex = users.findIndex((user) => user.id === followerId);
  users[followerIndex] = {
    ...users[followerIndex],
    following: [...users[followerIndex].following, followeeId],
  };

  const followeeIndex = users.findIndex((user) => user.id === followeeId);
  users[followeeIndex] = {
    ...users[followeeIndex],
    followers: [...users[followeeIndex].followers, followerId],
  };
};

export const unfollowUser = (followerId: string, followeeId: string): void => {
  const follower = getUserById(followerId);
  const followee = getUserById(followeeId);

  if (!follower || !followee) {
    throw new Error("User not found");
  }

  if (!follower.following.includes(followeeId)) {
    return;
  }

  const followerIndex = users.findIndex((user) => user.id === followerId);
  users[followerIndex] = {
    ...users[followerIndex],
    following: users[followerIndex].following.filter((id) => id !== followeeId),
  };

  const followeeIndex = users.findIndex((user) => user.id === followeeId);
  users[followeeIndex] = {
    ...users[followeeIndex],
    followers: users[followeeIndex].followers.filter((id) => id !== followerId),
  };
};
