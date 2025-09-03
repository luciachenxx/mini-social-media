import React, { useState, FormEvent, DragEvent, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import {  auth } from "../services/firebase";

interface PostFormProps {
  onPost: (content: string, image: string | null) => void;
  isDark: boolean;
}

const PostForm: React.FC<PostFormProps> = ({ onPost, isDark }) => {
  const [content, setContent] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!content.trim() && !image) return;
    onPost(content, image);
    setContent('');
    setImage(null);
  };

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setContent(e.target.value);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
  };

  const handleFileClick = (): void => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
          if (event.target?.result) {
            setImage(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const removeImage = (): void => {
    setImage(null);
  };

  return (
    <motion.form
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      onSubmit={handleSubmit}
      className={`p-6 rounded-2xl shadow-lg mb-8 border transition-all ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-teal-100'
      }`}
    >
      <textarea
        value={content}
        onChange={handleContentChange}
        placeholder="What's on your mind? Use #tags to categorize!"
        className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-lg resize-none h-28 transition-all ${
          isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-teal-200 text-gray-800'
        }`}
      />
      
      <div
        className={`border-2 border-dashed ${
          image ? 'border-teal-500' : 'border-teal-300'
        } p-4 mt-3 text-center rounded-lg transition-colors hover:bg-opacity-10 hover:bg-teal-500 cursor-pointer ${
          isDark ? 'bg-gray-700 text-teal-400' : 'bg-teal-50 text-teal-600'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleFileClick}
      >
        {image ? (
          <div className="relative">
            <img src={image} alt="Preview" className="max-w-full h-auto rounded-md shadow-sm" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          </div>
        ) : (
          <span className="text-sm font-medium">Drop an image here or click to upload</span>
        )}
      </div>
      
      <div className="flex justify-between items-center mt-4">
        <div className="text-xs text-gray-500">
          {content.length}/280 characters
        </div>
        <button
          type="submit"
          disabled={(!content.trim() && !image) || auth.currentUser?.isAnonymous}
          className="bg-gradient-to-r from-teal-500 to-indigo-500 text-white px-6 py-2 rounded-full hover:from-teal-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 shadow-md"
        >
          Share
        </button>
      </div>
    </motion.form>
  );
};

export default PostForm;