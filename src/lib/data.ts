"use server";

import { type User, type Post, PostType, type CreatePostData } from "./types";
import { v4 as uuidv4 } from "uuid";

// In-memory data store
const users: User[] = [
  {
    id: "1",
    username: "johndoe",
    joinedAt: "2023-01-15T00:00:00Z",
    followers: ["2", "3"],
    following: ["2"],
    postCount: 5,
  },
  {
    id: "2",
    username: "janedoe",
    joinedAt: "2023-02-20T00:00:00Z",
    followers: ["1"],
    following: ["1", "3"],
    postCount: 3,
  },
  {
    id: "3",
    username: "bobsmith",
    joinedAt: "2023-03-10T00:00:00Z",
    followers: ["2"],
    following: ["1"],
    postCount: 2,
  },
];

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

const getUserById = (id: string): User | undefined => {
  return users.find((user) => user.id === id);
};

export async function getCurrentUser(): Promise<User> {
  return users[0];
}

export async function getUserByUsername(
  username: string
): Promise<User | null> {
  const user = users.find((user) => user.username === username);
  return user || null;
}

export async function getPosts(
  userIds?: string[],
  username?: string
): Promise<Post[]> {
  let filteredPosts = [...posts];

  if (userIds && userIds.length > 0) {
    filteredPosts = filteredPosts.filter((post) =>
      userIds.includes(post.authorId)
    );
  }

  if (username) {
    const user = await getUserByUsername(username);
    if (user) {
      filteredPosts = filteredPosts.filter((post) => post.authorId === user.id);
    } else {
      return [];
    }
  }

  return filteredPosts.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function searchPosts(query: string): Promise<Post[]> {
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
}

export async function createPost(data: CreatePostData): Promise<Post> {
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
}

export async function followUser(
  followerId: string,
  followeeId: string
): Promise<void> {
  // Validate users exist
  const follower = getUserById(followerId);
  const followee = getUserById(followeeId);

  if (!follower || !followee) {
    throw new Error("User not found");
  }

  // Can't follow yourself
  if (followerId === followeeId) {
    throw new Error("You cannot follow yourself");
  }

  // Check if already following
  if (follower.following.includes(followeeId)) {
    return; // Already following, no action needed
  }

  // Update follower's following list
  const followerIndex = users.findIndex((user) => user.id === followerId);
  users[followerIndex] = {
    ...users[followerIndex],
    following: [...users[followerIndex].following, followeeId],
  };

  // Update followee's followers list
  const followeeIndex = users.findIndex((user) => user.id === followeeId);
  users[followeeIndex] = {
    ...users[followeeIndex],
    followers: [...users[followeeIndex].followers, followerId],
  };
}

export async function unfollowUser(
  followerId: string,
  followeeId: string
): Promise<void> {
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
}
