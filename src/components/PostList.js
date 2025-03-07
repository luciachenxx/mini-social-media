import React from "react";
import PostCard from "./PostCard";

const PostList = ({ posts, onLike, onComment, onReply, onDelete, onEdit, isDark }) => {
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
        />
      ))}
    </div>
  );
};

export default PostList;