import { useEffect } from "react";
import { Post } from "./Post"; // Ajuste o caminho conforme necessário
import { useAppDispatch, useAppSelector } from "../lib/redux/hooks";
import {
  fetchPosts,
  selectFilteredPosts,
  selectPostsStatus,
} from "../lib/redux/postsSlice";
import { useUser } from "../lib/user-context"; // Ajuste o caminho conforme necessário

interface PostFeedProps {
  filter: "all" | "following" | "user" | "search";
  username?: string;
  searchQuery?: string;
}

export function PostFeed({ filter, username, searchQuery }: PostFeedProps) {
  const dispatch = useAppDispatch();
  const { currentUser } = useUser();
  const posts = useAppSelector((state) =>
    selectFilteredPosts(
      state,
      filter,
      username,
      searchQuery,
      currentUser?.following
    )
  );
  const status = useAppSelector(selectPostsStatus);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchPosts());
    }
  }, [status, dispatch]);

  if (status === "loading") {
    return <div className="py-4 text-center">Loading posts...</div>;
  }

  if (status === "failed") {
    return (
      <div className="py-4 text-center text-destructive">
        Failed to load posts
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        No posts to display.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}
