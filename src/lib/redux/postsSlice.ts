import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { getPosts as getPostsApi, createPost as createPostApi } from "../data";
import { type Post, PostType, type CreatePostData } from "../types";
import type { RootState } from "./store";

interface PostsState {
  posts: Post[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: PostsState = {
  posts: [],
  status: "idle",
  error: null,
};

export const fetchPosts = createAsyncThunk("posts/fetchPosts", async () => {
  const response = await getPostsApi();
  return response;
});

export const createPost = createAsyncThunk(
  "posts/createPost",
  async (postData: CreatePostData) => {
    const response = await createPostApi(postData);
    return response;
  }
);

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPosts.fulfilled, (state, action: PayloadAction<Post[]>) => {
        state.status = "succeeded";
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch posts";
      })
      .addCase(createPost.fulfilled, (state, action: PayloadAction<Post>) => {
        state.posts.unshift(action.payload);
      });
  },
});

// Selectors
export const selectAllPosts = (state: RootState) => state.posts.posts;
export const selectPostsStatus = (state: RootState) => state.posts.status;
export const selectPostsError = (state: RootState) => state.posts.error;

export const selectFilteredPosts = (
  state: RootState,
  filter: string,
  username?: string,
  searchQuery?: string,
  followingIds?: string[]
) => {
  const allPosts = state.posts.posts;

  if (filter === "user" && username) {
    return allPosts.filter((post) => post.author.username === username);
  }

  if (filter === "following" && followingIds) {
    return allPosts.filter((post) => followingIds.includes(post.authorId));
  }

  if (filter === "search" && searchQuery) {
    const query = searchQuery.toLowerCase();
    return allPosts.filter((post) => {
      // Don't include reposts in search results
      if (post.type === PostType.REPOST) {
        return false;
      }

      // For regular posts, check if content matches
      if (post.type === PostType.REGULAR) {
        return post.content.toLowerCase().includes(query);
      }

      // For quote posts, only check the added text (not the original post)
      if (post.type === PostType.QUOTE) {
        return post.content.toLowerCase().includes(query);
      }

      return false;
    });
  }

  return allPosts;
};

export default postsSlice.reducer;
