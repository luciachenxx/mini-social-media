import React, { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { TrashIcon, ChatBubbleLeftIcon, PencilIcon } from "@heroicons/react/24/solid";
import { auth } from "../services/firebase";

// 型別定義
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

interface PostCardProps {
  post: Post;
  onLike: (id: string) => void;
  onComment: (id: string, comment: string) => void;
  onReply: (postId: string, commentIdx: number, reply: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string) => void;
  isDark: boolean;
}

// 時間轉換函數
const transferTimestamp = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return `${seconds}秒前`;
  if (minutes < 60) return `${minutes}分鐘前`;
  if (hours < 24) return `${hours}小時前`;
  if (days < 7) return `${days}天前`;

  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hoursStr = String(date.getHours()).padStart(2, "0");
  const minutesStr = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hoursStr}:${minutesStr}`;
};

const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  onLike, 
  onComment, 
  onReply, 
  onDelete, 
  onEdit, 
  isDark 
}) => {
  const [comment, setComment] = useState<string>("");
  const [showImage, setShowImage] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editContent, setEditContent] = useState<string>(post.content);
  const [replyInputs, setReplyInputs] = useState<Record<number, string | undefined>>({});

  // 檢查當前用戶是否已按讚
  const currentUserId = auth.currentUser?.uid;
  const isLikedByUser = post.likedBy && currentUserId && post.likedBy.includes(currentUserId);

  const handleCommentSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!comment.trim()) return;
    onComment(post.id, comment);
    setComment("");
  };

  const handleEditSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!editContent.trim()) return;
    onEdit(post.id, editContent);
    setIsEditing(false);
  };

  const handleReplySubmit = (e: FormEvent<HTMLFormElement>, commentIdx: number): void => {
    e.preventDefault();
    const replyText = replyInputs[commentIdx];
    if (!replyText?.trim()) return;
    onReply(post.id, commentIdx, replyText);
    setReplyInputs((prev) => ({ ...prev, [commentIdx]: "" }));
  };

  const toggleReplyInput = (commentIdx: number): void => {
    setReplyInputs((prev) => ({
      ...prev,
      [commentIdx]: prev[commentIdx] === undefined ? "" : undefined,
    }));
  };

  const handleReplyToComment = (commentIdx: number, targetUserName: string): void => {
    setReplyInputs((prev) => ({
      ...prev,
      [commentIdx]: `@${targetUserName} `,
    }));
    
    // 自動 focus 到輸入框
    setTimeout(() => {
      const input = document.querySelector(`#reply-input-${commentIdx}`) as HTMLInputElement;
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setComment(e.target.value);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setEditContent(e.target.value);
  };

  const handleReplyInputChange = (e: React.ChangeEvent<HTMLInputElement>, commentIdx: number): void => {
    setReplyInputs((prev) => ({ ...prev, [commentIdx]: e.target.value }));
  };

  const handleCancelEdit = (): void => {
    setIsEditing(false);
    setEditContent(post.content);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border ${
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-teal-100"
      }`}
    >
      <div className="flex items-center space-x-3 mb-3">
        {post.user.avatar ? (
          <img 
            src={post.user.avatar} 
            alt={post.user.name} 
            className="w-10 h-10 rounded-full shadow-sm" 
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center shadow-sm">
            <span className="text-sm font-bold text-white">A</span>
          </div>
        )}
        <span className="font-semibold text-lg">{post.user.name}</span>
      </div>

      {isEditing ? (
        <form onSubmit={handleEditSubmit} className="mb-3">
          <textarea
            value={editContent}
            onChange={handleEditChange}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
              isDark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-teal-200 text-gray-800"
            }`}
          />
          <div className="flex space-x-2 mt-2">
            <button 
              type="submit" 
              className="bg-teal-500 text-white px-4 py-1 rounded-lg hover:bg-teal-600"
            >
              Save
            </button>
            <button 
              type="button"
              onClick={handleCancelEdit} 
              className="bg-gray-500 text-white px-4 py-1 rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="flex justify-between items-start">
          <p className="text-lg leading-relaxed">{post.content}</p>
          {currentUserId === post.user.id && (
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
          )}
        </div>
      )}

      {post.tags && post.tags.length > 0 && (
        <div className="mt-2 flex space-x-2">
          {post.tags.map((tag, idx) => (
            <span 
              key={idx} 
              className={`text-sm font-medium px-2 py-1 rounded-full ${
                isDark ? "bg-teal-700 text-teal-200" : "bg-teal-100 text-teal-600"
              }`}
            >
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
          className={`flex items-center space-x-1 transition-all duration-300 transform hover:scale-110 ${
            isLikedByUser 
              ? 'text-red-500 hover:text-red-600' 
              : isDark 
                ? 'text-gray-100 hover:text-red-500'
                : 'text-gray-700 hover:text-red-500'
          }`}
        >
          <motion.svg 
            className="w-5 h-5" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            animate={isLikedByUser ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
          </motion.svg>
          <span className={`${isLikedByUser ? 'font-semibold' : ''}`}>
            {post.likes || 0}
          </span>
        </button>
        <span className="flex items-center space-x-1">
          <ChatBubbleLeftIcon className="w-5 h-5" />
          <span>{post.comments?.length || 0}</span>
        </span>
      </div>

      <div className="mt-4">
        {post.comments?.map((cmt, idx) => (
          <div key={idx} className="mt-2">
            {/* 第二層：主要留言 */}
            <div className={`flex items-start space-x-3 p-3 rounded-lg ${
              isDark ? "bg-gray-700 text-gray-200" : "bg-teal-50 text-gray-800"
            }`}>
              {cmt.user.avatar ? (
                <img 
                  src={cmt.user.avatar} 
                  alt={cmt.user.name} 
                  className="w-8 h-8 rounded-full flex-shrink-0" 
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-white">A</span>
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-baseline space-x-2">
                  <span className="font-semibold text-sm">{cmt.user.name}</span>
                  <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    {transferTimestamp(cmt.timestamp)}
                  </span>
                </div>
                <p className="text-sm mt-1">{cmt.text}</p>
                <button
                  onClick={() => handleReplyToComment(idx, cmt.user.name)}
                  className={`text-xs mt-1 ${
                    isDark ? "text-teal-300 hover:text-teal-400" : "text-teal-600 hover:text-teal-700"
                  }`}
                >
                  Reply @{cmt.user.name}
                </button>
              </div>
            </div>

            {/* 回覆輸入框 */}
            {replyInputs[idx] !== undefined && (
              <form onSubmit={(e) => handleReplySubmit(e, idx)} className="mt-2 ml-11">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id={`reply-input-${idx}`}
                    value={replyInputs[idx] || ""}
                    onChange={(e) => handleReplyInputChange(e, idx)}
                    placeholder="Write a reply..."
                    className={`flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      isDark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-teal-200 text-gray-800"
                    }`}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => toggleReplyInput(idx)}
                      className="bg-gray-500 bg-opacity-70 text-white px-4 py-1 rounded-lg hover:bg-gray-600 transition-all duration-200 whitespace-nowrap"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-teal-500 to-indigo-500 text-white px-4 py-1 rounded-lg hover:from-teal-600 hover:to-indigo-600 transition-all duration-200 whitespace-nowrap"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* 第三層：顯示回覆 */}
            {cmt.replies && cmt.replies.length > 0 && (
              <div className="ml-11 mt-2 space-y-2">
                {cmt.replies.map((reply, rIdx) => (
                  <div 
                    key={rIdx} 
                    className={`flex items-start space-x-3 p-2 rounded-lg ${
                      isDark ? "bg-gray-600 text-gray-200" : "bg-teal-100 text-gray-800"
                    }`}
                  >
                    {reply.user.avatar ? (
                      <img 
                        src={reply.user.avatar} 
                        alt={reply.user.name} 
                        className="w-6 h-6 rounded-full flex-shrink-0" 
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-white">A</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-baseline space-x-2">
                        <span className="font-semibold text-xs">{reply.user.name}</span>
                        <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                          {transferTimestamp(reply.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{reply.text}</p>
                      {/* 新增：第三層回覆按鈕 */}
                      <button
                        onClick={() => handleReplyToComment(idx, reply.user.name)}
                        className={`text-xs mt-1 ${
                          isDark ? "text-teal-300 hover:text-teal-400" : "text-teal-600 hover:text-teal-700"
                        }`}
                      >
                        Reply @{reply.user.name}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* 主要留言輸入框 */}
        <form onSubmit={handleCommentSubmit} className="mt-3 flex space-x-2">
          <input
            value={comment}
            onChange={handleInputChange}
            placeholder="Add a comment..."
            className={`flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
              isDark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-teal-200 text-gray-800"
            }`}
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
          <img 
            src={post.image || ""} 
            alt="Full" 
            className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg" 
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default PostCard;