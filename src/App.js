// src/App.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import PostForm from './components/PostForm';
import PostList from './components/PostList';

const App = () => {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [isDark, setIsDark] = useState(false);

  const users = [
    { id: 1, name: 'Alex', avatar: 'https://i.pravatar.cc/40?u=alex' },
    { id: 2, name: 'Luna', avatar: 'https://i.pravatar.cc/40?u=luna' },
  ];

  useEffect(() => {
    const savedPosts = JSON.parse(localStorage.getItem('posts')) || [];
    setPosts(savedPosts);
  }, []);

  useEffect(() => {
    localStorage.setItem('posts', JSON.stringify(posts));
  }, [posts]);

  const addPost = (content, image) => {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const newPost = {
      id: Date.now(),
      content,
      image,
      likes: 0,
      comments: [],
      tags: content.match(/#\w+/g) || [],
      user: randomUser,
    };
    setPosts([newPost, ...posts]);
    toast.success('Post added!');
  };

  const likePost = (id) => {
    setPosts(posts.map(post =>
      post.id === id ? { ...post, likes: post.likes + 1 } : post
    ));
    toast('Liked!', { icon: '❤️' });
  };

  const deletePost = (id) => {
    setPosts(posts.filter(post => post.id !== id));
    toast('Post deleted', { icon: '🗑️' });
  };

  const editPost = (id, newContent) => {
    setPosts(posts.map(post =>
      post.id === id ? { ...post, content: newContent, tags: newContent.match(/#\w+/g) || [] } : post
    ));
    toast.success('Post updated!');
  };

  const addComment = (id, comment) => {
    setPosts(posts.map(post =>
      post.id === id ? { ...post, comments: [...post.comments, comment] } : post
    ));
    toast('New comment!', { icon: '💬' });
  };

  const filteredPosts = posts.filter(post =>
    post.content.toLowerCase().includes(search.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className={`max-w-4xl mx-auto p-6 min-h-screen transition-colors duration-500 ${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100' : 'bg-gradient-to-br from-teal-50 to-indigo-100 text-gray-800'}`}>
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-extrabold tracking-tight"
        >
          Social Snap
        </motion.h1>
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-full bg-teal-500 text-white hover:bg-teal-600 transition-all duration-300 shadow-md"
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search posts or #tags..."
        className={`w-full p-3 mb-6 border rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-teal-200 text-gray-700'}`}
      />
      <PostForm onPost={addPost} isDark={isDark} />
      <PostList posts={filteredPosts} onLike={likePost} onComment={addComment} onDelete={deletePost} onEdit={editPost} isDark={isDark} />
    </div>
  );
};

export default App;