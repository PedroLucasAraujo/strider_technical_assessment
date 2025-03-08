import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { PostType } from "../lib/types";
import { useUser } from "../lib/user-context";
import { getUserByUsername } from "../lib/data";
import { useAppDispatch } from "../lib/redux/hooks";
import { createPost } from "../lib/redux/postsSlice";

interface NewPostFormProps {
  profileUsername?: string;
}

export function NewPostForm({ profileUsername }: NewPostFormProps) {
  const { currentUser } = useUser();
  const dispatch = useAppDispatch();
  const [content, setContent] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setContent(text);
    setCharCount(text.length);

    if (text.length > 777) {
      setError("Post cannot exceed 777 characters");
    } else {
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      setError("You must be logged in to post");
      return;
    }

    if (!content.trim()) {
      setError("Post cannot be empty");
      return;
    }

    if (content.length > 777) {
      setError("Post cannot exceed 777 characters");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      let authorId = currentUser.id;

      if (profileUsername) {
        const profileUser = await getUserByUsername(profileUsername);
        if (profileUser) {
          authorId = profileUser.id;
        }
      }

      await dispatch(
        createPost({
          content,
          authorId,
          type: PostType.REGULAR,
        })
      ).unwrap();

      setContent("");
      setCharCount(0);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to create post");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <Card className="glass-card">
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-4">
          <Textarea
            placeholder="What's happening?"
            value={content}
            onChange={handleChange}
            className="resize-none bg-secondary/50 border-blue-900/30 focus:border-blue-500/50"
            rows={3}
          />

          <div className="flex justify-between items-center mt-2">
            <span
              className={`text-xs ${
                charCount > 777 ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {charCount}/777
            </span>
            {error && <p className="text-destructive text-xs">{error}</p>}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end border-t border-blue-900/30 pt-3">
          <Button
            type="submit"
            disabled={!content.trim() || content.length > 777 || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Post
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
