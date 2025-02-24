// src/components/PostCard.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrashIcon, ChatBubbleLeftIcon, PencilIcon } from '@heroicons/react/24/solid';

const PostCard = ({ post, onLike, onComment, onDelete, onEdit, isDark }) => {
  const [comment, setComment] = useState('');
  const [showImage, setShowImage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    onComment(post.id, comment);
    setComment('');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    onEdit(post.id, editContent);
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-teal-100'}`}
    >
      <div className="flex items-center space-x-3 mb-3">
        <img src={post.user.avatar} alt={post.user.name} className="w-10 h-10 rounded-full shadow-sm" />
        <span className="font-semibold text-lg">{post.user.name}</span>
      </div>
      {isEditing ? (
        <form onSubmit={handleEditSubmit} className="mb-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-teal-200 text-gray-800'}`}
          />
          <div className="flex space-x-2 mt-2">
            <button type="submit" className="bg-teal-500 text-white px-4 py-1 rounded-lg hover:bg-teal-600">Save</button>
            <button onClick={() => setIsEditing(false)} className="bg-gray-500 text-white px-4 py-1 rounded-lg hover:bg-gray-600">Cancel</button>
          </div>
        </form>
      ) : (
        <div className="flex justify-between items-start">
          <p className="text-lg leading-relaxed">{post.content}</p>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-teal-500 hover:text-teal-600 transition-colors"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete(post.id)}
              className="text-red-500 hover:text-red-600 transition-colors"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      {post.tags.length > 0 && (
        <div className="mt-2 flex space-x-2">
          {post.tags.map((tag, idx) => (
            <span key={idx} className={`text-sm font-medium px-2 py-1 rounded-full ${isDark ? 'bg-teal-700 text-teal-200' : 'bg-teal-100 text-teal-600'}`}>
              {tag}
            </span>
          ))}
        </div>
      )}
      {post.image && (
        <img
          src={post.image}
          alt="Post"
          className="mt-4 max-w-full h-48 object-cover rounded-lg shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => setShowImage(true)}
        />
      )}
      <div className="mt-4 flex space-x-6">
        <button
          onClick={() => onLike(post.id)}
          className="flex items-center space-x-1 hover:text-red-500 transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
          </svg>
          <span>{post.likes}</span>
        </button>
        <span className="flex items-center space-x-1">
          <ChatBubbleLeftIcon className="w-5 h-5" />
          <span>{post.comments.length}</span>
        </span>
      </div>
      <div className="mt-4">
        {post.comments.map((cmt, idx) => (
          <p key={idx} className={`text-sm p-2 rounded-md mt-1 ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-teal-50 text-gray-600'}`}>{cmt}</p>
        ))}
        <form onSubmit={handleCommentSubmit} className="mt-3 flex space-x-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className={`flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-teal-200 text-gray-800'}`}
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-teal-500 to-indigo-500 text-white px-4 py-1 rounded-lg hover:from-teal-600 hover:to-indigo-600 transition-all duration-200"
          >
            Send
          </button>
        </form>
      </div>

      {showImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setShowImage(false)}
        >
          <img src={post.image} alt="Full" className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg" />
        </motion.div>
      )}
    </motion.div>
  );
};

export default PostCard;