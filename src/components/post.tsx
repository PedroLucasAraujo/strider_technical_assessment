import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Post as PostType, PostType as PostTypeEnum } from "../lib/types";
import { useUser } from "../lib/user-context";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Repeat, Reply } from "lucide-react";
import { useAppDispatch } from "../lib/redux/hooks";
import { createPost } from "../lib/redux/postsSlice";

interface PostProps {
  post: PostType;
}

export const Post: React.FC<PostProps> = ({ post }) => {
  const { currentUser } = useUser();
  const dispatch = useAppDispatch();
  const [isReposting, setIsReposting] = useState(false);
  const [isQuoting, setIsQuoting] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [quoteText, setQuoteText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [replyCharCount, setReplyCharCount] = useState(0);
  const [error, setError] = useState("");

  const handleQuoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setQuoteText(text);
    setCharCount(text.length);

    if (text.length > 777) {
      setError("Post cannot exceed 777 characters");
    } else {
      setError("");
    }
  };

  const handleReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setReplyText(text);
    setReplyCharCount(text.length);

    if (text.length > 777) {
      setError("Reply cannot exceed 777 characters");
    } else {
      setError("");
    }
  };

  const handleRepost = async () => {
    if (!currentUser) return;

    try {
      await dispatch(
        createPost({
          content: "",
          authorId: currentUser.id,
          type: PostTypeEnum.REPOST,
          originalPostId: post.id,
        })
      ).unwrap();

      setIsReposting(false);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to repost");
      }
    }
  };

  const handleQuotePost = async () => {
    if (!currentUser || !quoteText.trim()) return;

    if (quoteText.length > 777) {
      setError("Post cannot exceed 777 characters");
      return;
    }

    try {
      await dispatch(
        createPost({
          content: quoteText,
          authorId: currentUser.id,
          type: PostTypeEnum.QUOTE,
          originalPostId: post.id,
        })
      ).unwrap();

      setIsQuoting(false);
      setQuoteText("");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to quote post");
      }
    }
  };

  const handleReply = async () => {
    if (!currentUser || !replyText.trim()) return;

    if (replyText.length > 777) {
      setError("Reply cannot exceed 777 characters");
      return;
    }

    try {
      await dispatch(
        createPost({
          content: replyText,
          authorId: currentUser.id,
          type: PostTypeEnum.REPLY,
          replyToId: post.id,
        })
      ).unwrap();

      setIsReplying(false);
      setReplyText("");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to reply to post");
      }
    }
  };

  const renderOriginalPost = () => {
    if (!post.originalPost) return null;

    return (
      <Card className="mt-2 border border-muted">
        <CardHeader className="py-2 px-3">
          <Link
            to={`/profile/${post.originalPost.author.username}`}
            className="text-sm font-medium hover:underline"
          >
            @{post.originalPost.author.username}
          </Link>
        </CardHeader>
        <CardContent className="py-2 px-3">
          <p className="text-sm">{post.originalPost.content}</p>
        </CardContent>
      </Card>
    );
  };

  const renderReplyToPost = () => {
    if (!post.replyTo) return null;

    return (
      <Card className="mb-2 border border-muted">
        <CardHeader className="py-2 px-3">
          <Link
            to={`/profile/${post.replyTo.author.username}`}
            className="text-sm font-medium hover:underline"
          >
            @{post.replyTo.author.username}
          </Link>
        </CardHeader>
        <CardContent className="py-2 px-3">
          <p className="text-sm">{post.replyTo.content}</p>
        </CardContent>
      </Card>
    );
  };

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
  });

  return (
    <Card className="glass-card overflow-hidden">
      {post.type === PostTypeEnum.REPLY && renderReplyToPost()}

      <CardHeader className="py-3 px-4">
        <div className="flex justify-between items-start">
          <Link
            to={`/profile/${post.author.username}`}
            className="font-medium hover:underline text-blue-300"
          >
            @{post.author.username}
          </Link>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
      </CardHeader>

      <CardContent className="py-2 px-4">
        {post.type === PostTypeEnum.REGULAR && <p>{post.content}</p>}

        {post.type === PostTypeEnum.REPOST && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Repeat size={16} />
            <span>Reposted</span>
            {renderOriginalPost()}
          </div>
        )}

        {post.type === PostTypeEnum.QUOTE && (
          <div>
            <p className="mb-2">{post.content}</p>
            {renderOriginalPost()}
          </div>
        )}

        {post.type === PostTypeEnum.REPLY && (
          <div>
            <p>{post.content}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="py-2 px-4 flex gap-2">
        {currentUser && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => setIsReplying(true)}
            >
              <Reply size={16} className="mr-1" />
              Reply
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => setIsReposting(true)}
            >
              <Repeat size={16} className="mr-1" />
              Repost
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => setIsQuoting(true)}
            >
              <MessageSquare size={16} className="mr-1" />
              Quote
            </Button>
          </>
        )}
      </CardFooter>

      {isReplying && (
        <div className="p-4 border-t">
          <p className="mb-2">Reply to this post:</p>
          <Textarea
            placeholder="Write your reply..."
            value={replyText}
            onChange={handleReplyChange}
            className="mb-2"
          />
          <div className="flex justify-between items-center mb-2">
            <span
              className={`text-xs ${
                replyCharCount > 777
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {replyCharCount}/777
            </span>
            {error && <p className="text-destructive text-xs">{error}</p>}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleReply}
              disabled={!replyText.trim() || replyText.length > 777}
            >
              Reply
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsReplying(false);
                setReplyText("");
                setError("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isReposting && (
        <div className="p-4 border-t">
          <p className="mb-2">Repost this to your followers?</p>
          {error && <p className="text-destructive text-sm mb-2">{error}</p>}
          <div className="flex gap-2">
            <Button size="sm" onClick={handleRepost}>
              Repost
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsReposting(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isQuoting && (
        <div className="p-4 border-t">
          <Textarea
            placeholder="Add a comment..."
            value={quoteText}
            onChange={handleQuoteChange}
            className="mb-2"
          />
          <div className="flex justify-between items-center mb-2">
            <span
              className={`text-xs ${
                charCount > 777 ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {charCount}/777
            </span>
            {error && <p className="text-destructive text-xs">{error}</p>}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleQuotePost}
              disabled={!quoteText.trim() || quoteText.length > 777}
            >
              Quote Post
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsQuoting(false);
                setQuoteText("");
                setError("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
