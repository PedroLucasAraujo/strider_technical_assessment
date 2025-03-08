import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { PostFeed } from "./ui/PostFeed";
import { NewPostForm } from "./ui/NewPostForm";
import { useUser } from "../lib/user-context";
import { getUserByUsername, followUser, unfollowUser } from "../lib/data";
import type { User } from "../@types/index";

interface UserProfileProps {
  username: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ username }) => {
  const { currentUser } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUserByUsername(username);
      setUser(userData);

      if (currentUser && userData) {
        setIsFollowing(currentUser.following.includes(userData.id));
      }
    };

    fetchUser();
  }, [username, currentUser]);

  const handleFollow = async () => {
    if (!user || !currentUser) return;

    setIsLoading(true);

    if (isFollowing) {
      await unfollowUser(currentUser.id, user.id);
      setIsFollowing(false);
    } else {
      await followUser(currentUser.id, user.id);
      setIsFollowing(true);
    }

    setIsLoading(false);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const joinDate = new Date(user.joinedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-300">{user.username}</h1>
          <p className="text-muted-foreground">Joined {joinDate}</p>
        </div>

        {currentUser && currentUser.id !== user.id && (
          <Button
            onClick={handleFollow}
            disabled={isLoading}
            variant={isFollowing ? "outline" : "default"}
            className={
              isFollowing
                ? "border-blue-500/50 text-blue-300"
                : "bg-blue-600 hover:bg-blue-700"
            }
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </Button>
        )}
      </div>

      <div className="flex gap-4 text-sm">
        <div>
          <span className="font-bold text-blue-300">
            {user.followers.length}
          </span>{" "}
          Followers
        </div>
        <div>
          <span className="font-bold text-blue-300">
            {user.following.length}
          </span>{" "}
          Following
        </div>
        <div>
          <span className="font-bold text-blue-300">{user.postCount}</span>{" "}
          Posts
        </div>
      </div>

      <NewPostForm profileUsername={username} />

      <h2 className="text-xl font-semibold mt-6 text-blue-300">Posts</h2>
      <PostFeed filter="user" username={username} />
    </div>
  );
};
