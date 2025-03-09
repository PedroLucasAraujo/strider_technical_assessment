import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  getPosts as getPostsApi,
  createPost as createPostApi,
  searchPosts as searchPostsApi,
} from "../data";
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

// Async Thunks
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

export const searchPosts = createAsyncThunk(
  "posts/searchPosts",
  async (query: string) => {
    const response = await searchPostsApi(query);
    return response;
  }
);

// Slice
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
      })
      .addCase(
        searchPosts.fulfilled,
        (state, action: PayloadAction<Post[]>) => {
          // Não atualizamos o array principal de posts com os resultados da pesquisa
          // Eles são filtrados no seletor
        }
      );
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
      // Não incluir reposts nos resultados da pesquisa
      if (post.type === PostType.REPOST) {
        return false;
      }

      if (post.type === PostType.REGULAR) {
        return post.content.toLowerCase().includes(query);
      }

      if (post.type === PostType.QUOTE) {
        return post.content.toLowerCase().includes(query);
      }

      if (post.type === PostType.REPLY) {
        return post.content.toLowerCase().includes(query);
      }

      return false;
    });
  }

  return allPosts;
};

export default postsSlice.reducer;
