// src/components/PostList.js
import React from 'react';
import { motion } from 'framer-motion';
import PostCard from './PostCard';

const PostList = ({ posts, onLike, onComment, onDelete, onEdit, isDark }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1 }}
      className="space-y-6"
    >
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onLike={onLike}
          onComment={onComment}
          onDelete={onDelete}
          onEdit={onEdit}
          isDark={isDark}
        />
      ))}
    </motion.div>
  );
};

export default PostList;