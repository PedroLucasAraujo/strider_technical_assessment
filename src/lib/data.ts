import { v4 as uuidv4 } from "uuid";
import { User, Post, PostType, CreatePostData } from "./types";

// In-memory data store
let users: User[] = [
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
  {
    id: "8",
    content: "I agree! It adds a nice depth to the interface.",
    authorId: "1",
    author: users[0],
    createdAt: "2023-06-21T15:30:00Z",
    type: PostType.REPLY,
    replyToId: "7",
    replyTo: {
      id: "7",
      content: "Glassmorphism is a cool UI trend",
      authorId: "3",
      author: users[2],
      createdAt: "2023-06-21T14:20:00Z",
      type: PostType.REGULAR,
    },
  },
  {
    id: "9",
    content: "What resources are you using to learn Redux?",
    authorId: "2",
    author: users[1],
    createdAt: "2023-06-19T13:15:00Z",
    type: PostType.REPLY,
    replyToId: "5",
    replyTo: {
      id: "5",
      content: "Learning about Redux and state management today!",
      authorId: "1",
      author: users[0],
      createdAt: "2023-06-19T11:30:00Z",
      type: PostType.REGULAR,
    },
  },
  {
    id: "10",
    content: "The official Redux documentation and some YouTube tutorials.",
    authorId: "1",
    author: users[0],
    createdAt: "2023-06-19T14:20:00Z",
    type: PostType.REPLY,
    replyToId: "9",
    replyTo: {
      id: "9",
      content: "What resources are you using to learn Redux?",
      authorId: "2",
      author: users[1],
      createdAt: "2023-06-19T13:15:00Z",
      type: PostType.REPLY,
    },
  },
];

// Helper function to get user by ID
const getUserById = (id: string): User | undefined => {
  return users.find((user) => user.id === id);
};

// Helper function to get post by ID
const getPostById = (id: string): Post | undefined => {
  return posts.find((post) => post.id === id);
};

// Get current user (for demo purposes, we'll use the first user)
export const getCurrentUser = (): Promise<User> => {
  return Promise.resolve(users[0]);
};

// Get user by username
export const getUserByUsername = (username: string): Promise<User | null> => {
  const user = users.find((user) => user.username === username);
  return Promise.resolve(user || null);
};

// Get posts with optional filtering
export const getPosts = (
  userIds?: string[],
  username?: string
): Promise<Post[]> => {
  let filteredPosts = [...posts];

  // Filter by user IDs (for following feed)
  if (userIds && userIds.length > 0) {
    filteredPosts = filteredPosts.filter((post) =>
      userIds.includes(post.authorId)
    );
  }

  // Filter by username
  if (username) {
    const user = users.find((user) => user.username === username);
    if (user) {
      filteredPosts = filteredPosts.filter((post) => post.authorId === user.id);
    } else {
      return Promise.resolve([]);
    }
  }

  // Sort by creation date (newest first)
  return Promise.resolve(
    filteredPosts.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  );
};

// Search posts
export const searchPosts = (query: string): Promise<Post[]> => {
  if (!query.trim()) {
    return Promise.resolve([]);
  }

  const normalizedQuery = query.toLowerCase().trim();

  const filteredPosts = posts.filter((post) => {
    // Don't include reposts in search results
    if (post.type === PostType.REPOST) {
      return false;
    }

    // For regular posts, check if content matches
    if (post.type === PostType.REGULAR) {
      return post.content.toLowerCase().includes(normalizedQuery);
    }

    // For quote posts, only check the added text (not the original post)
    if (post.type === PostType.QUOTE) {
      return post.content.toLowerCase().includes(normalizedQuery);
    }

    // For reply posts, check if content matches
    if (post.type === PostType.REPLY) {
      return post.content.toLowerCase().includes(normalizedQuery);
    }

    return false;
  });

  return Promise.resolve(
    filteredPosts.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  );
};

// Create a new post
export const createPost = (data: CreatePostData): Promise<Post> => {
  const { content, authorId, type, originalPostId, replyToId } = data;

  // Validate user exists
  const author = getUserById(authorId);
  if (!author) {
    return Promise.reject(new Error("User not found"));
  }

  // Check daily post limit (5 posts per day)
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
    return Promise.reject(
      new Error("You have reached the daily limit of 5 posts")
    );
  }

  // Validate content length
  if (content.length > 777) {
    return Promise.reject(new Error("Post cannot exceed 777 characters"));
  }

  // For reposts and quote posts, validate original post exists
  let originalPost: Post | undefined;
  if (type === PostType.REPOST || type === PostType.QUOTE) {
    if (!originalPostId) {
      return Promise.reject(
        new Error("Original post ID is required for reposts and quote posts")
      );
    }

    originalPost = getPostById(originalPostId);
    if (!originalPost) {
      return Promise.reject(new Error("Original post not found"));
    }
  }

  // For reply posts, validate reply-to post exists
  let replyTo: Post | undefined;
  if (type === PostType.REPLY) {
    if (!replyToId) {
      return Promise.reject(
        new Error("Reply-to post ID is required for replies")
      );
    }

    replyTo = getPostById(replyToId);
    if (!replyTo) {
      return Promise.reject(new Error("Reply-to post not found"));
    }
  }

  // Create the new post
  const newPost: Post = {
    id: uuidv4(),
    content,
    authorId,
    author,
    createdAt: new Date().toISOString(),
    type,
    originalPostId,
    originalPost,
    replyToId,
    replyTo,
  };

  // Add to posts array
  posts = [newPost, ...posts];

  // Update user's post count
  const userIndex = users.findIndex((user) => user.id === authorId);
  if (userIndex !== -1) {
    users[userIndex] = {
      ...users[userIndex],
      postCount: users[userIndex].postCount + 1,
    };
  }

  return Promise.resolve(newPost);
};

// Follow a user
export const followUser = (
  followerId: string,
  followeeId: string
): Promise<void> => {
  // Validate users exist
  const follower = getUserById(followerId);
  const followee = getUserById(followeeId);

  if (!follower || !followee) {
    return Promise.reject(new Error("User not found"));
  }

  // Can't follow yourself
  if (followerId === followeeId) {
    return Promise.reject(new Error("You cannot follow yourself"));
  }

  // Check if already following
  if (follower.following.includes(followeeId)) {
    return Promise.resolve(); // Already following, no action needed
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

  return Promise.resolve();
};

// Unfollow a user
export const unfollowUser = (
  followerId: string,
  followeeId: string
): Promise<void> => {
  // Validate users exist
  const follower = getUserById(followerId);
  const followee = getUserById(followeeId);

  if (!follower || !followee) {
    return Promise.reject(new Error("User not found"));
  }

  // Check if actually following
  if (!follower.following.includes(followeeId)) {
    return Promise.resolve(); // Not following, no action needed
  }

  // Update follower's following list
  const followerIndex = users.findIndex((user) => user.id === followerId);
  users[followerIndex] = {
    ...users[followerIndex],
    following: users[followerIndex].following.filter(
      (id: string) => id !== followeeId
    ),
  };

  // Update followee's followers list
  const followeeIndex = users.findIndex((user) => user.id === followeeId);
  users[followeeIndex] = {
    ...users[followeeIndex],
    followers: users[followeeIndex].followers.filter(
      (id: string) => id !== followerId
    ),
  };

  return Promise.resolve();
};
