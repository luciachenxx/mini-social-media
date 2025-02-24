// src/components/PostForm.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const PostForm = ({ onPost, isDark }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;
    onPost(content, image);
    setContent('');
    setImage(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      onSubmit={handleSubmit}
      className={`p-6 rounded-2xl shadow-lg mb-8 border transition-all ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-teal-100'}`}
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind? Use #tags to categorize!"
        className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-lg resize-none h-28 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-teal-200 text-gray-800'}`}
      />
      <div
        className={`border-2 border-dashed ${image ? 'border-teal-500' : 'border-teal-300'} p-4 mt-3 text-center rounded-lg transition-colors hover:bg-opacity-10 hover:bg-teal-500 ${isDark ? 'bg-gray-700 text-teal-400' : 'bg-teal-50 text-teal-600'}`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {image ? (
          <img src={image} alt="Preview" className="max-w-full h-auto rounded-md shadow-sm" />
        ) : (
          <span className="text-sm font-medium">Drop an image here or click to upload</span>
        )}
      </div>
      <button
        type="submit"
        className="mt-4 bg-gradient-to-r from-teal-500 to-indigo-500 text-white px-6 py-2 rounded-full hover:from-teal-600 hover:to-indigo-600 transition-all duration-300 shadow-md"
      >
        Share
      </button>
    </motion.form>
  );
};

export default PostForm;