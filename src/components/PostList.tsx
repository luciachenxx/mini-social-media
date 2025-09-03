import React from "react";
import PostCard from "./PostCard";

interface User {
  id: string;
  name: string;
  avatar: string;
}

interface Reply {
  text: string;
  user: User;
  timestamp: number;
}

interface Comment {
  text: string;
  user: User;
  timestamp: number;
  replies?: Reply[];
}

interface Post {
  id: string;
  content: string;
  image?: string | null;
  likes: number;
  likedBy: string[];
  comments: Comment[];
  tags: string[];
  user: User;
  timestamp: number;
}

interface PostListProps {
  posts: Post[];
  onLike: (id: string) => void;
  onComment: (id: string, comment: string) => void;
  onReply: (postId: string, commentIdx: number, reply: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string) => void;
  isDark: boolean;
  onDeleteComment: (postId: string, commentIdx: number) => void;
}

const PostList: React.FC<PostListProps> = ({ 
  posts, 
  onLike, 
  onComment, 
  onReply, 
  onDelete, 
  onEdit, 
  isDark,
  onDeleteComment,
}) => {
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={onLike}
          onComment={onComment}
          onReply={onReply}
          onDelete={onDelete}
          onEdit={onEdit}
          isDark={isDark}
          onDeleteComment={onDeleteComment}
        />
      ))}
    </div>
  );
};

export default PostList;