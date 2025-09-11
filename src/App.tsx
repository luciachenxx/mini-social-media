import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { db, auth } from "./services/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Unsubscribe,
} from "firebase/firestore";
import {
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  signInWithEmailAndPassword,
  User,
} from "firebase/auth";
import PostForm from "./components/PostForm";
import PostList from "./components/PostList";
import ProfileModal from "./components/ProfileModal";

// 型別定義
interface UserData {
  id: string;
  name: string;
  avatar: string;
}

interface Reply {
  text: string;
  user: UserData;
  timestamp: number;
}

interface Comment {
  text: string;
  user: UserData;
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
  user: UserData;
  timestamp: number;
}

const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState<string>("");
  const [isDark, setIsDark] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userAvatar, setUserAvatar] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  useEffect(() => {
    let unsubscribePosts: Unsubscribe | null = null;

    const unsubscribeAuth = auth.onAuthStateChanged((user: User | null) => {
      if (user) {
        // 更新用戶資料
        const name = user.displayName || (user.isAnonymous ? "Anonymous" : "User");
        const avatarImg = `https://ui-avatars.com/api/?name=${encodeURIComponent(name.charAt(0))}&background=666666&color=fff&size=40`;
        const avatar = user.isAnonymous 
          ? avatarImg
          : (user.photoURL || avatarImg);
        
        setUserName(name);
        setUserAvatar(avatar);
        localStorage.setItem("userName", name);
        localStorage.setItem("userAvatar", avatar);

        // 只有在用戶登入後才開始監聽 Firestore
        unsubscribePosts = onSnapshot(
          query(collection(db, "posts"), orderBy("timestamp", "desc")),
          (snapshot) => {
            const postsData = snapshot.docs.map((doc) => ({ 
              id: doc.id, 
              ...doc.data() 
            })) as Post[];

            setPosts(postsData);
            setError(null);
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching posts:", error);
            setError("Failed to load posts.");
            toast.error("Failed to load posts");
            setLoading(false);
          }
        );
      } else {
        setUserName("");
        setUserAvatar("");
        setPosts([]);
        localStorage.removeItem("userName");
        localStorage.removeItem("userAvatar");
        setLoading(false);
        if (unsubscribePosts) unsubscribePosts();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribePosts) unsubscribePosts();
    };
  }, []);

  // 匿名登入
  const handleAnonymousLogin = async (): Promise<void> => {
    try {
      setLoading(true);
      await signInAnonymously(auth);
      toast.success("Logged in anonymously!");
    } catch (error) {
      console.error("Anonymous login error:", error);
      toast.error("Failed to login anonymously");
      setLoading(false);
    }
  };

  // Google 登入
  const handleGoogleLogin = async (): Promise<void> => {
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true);
      await signInWithPopup(auth, provider);
      toast.success("Logged in with Google!");
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Failed to login with Google");
      setLoading(false);
    }
  };

  // 登入為示範用戶
  const handleDemoLogin = async (): Promise<void> => {
    try {
      setLoading(true);
      
      try {
        await signInWithEmailAndPassword(auth, "demo@example.com", "123456");
        toast.success("Logged in with Demo User!");
      } catch (loginError: any) {
        // 如果帳號不存在，提示用戶
        if (loginError.code === 'auth/invalid-login-credentials' || loginError.code === 'auth/user-not-found') {
          toast.error("Demo account not found. Please contact admin to create demo account.");
        } else {
          throw loginError;
        }
      }
    } catch (error) {
      console.error("Demo login error:", error);
      toast.error("Failed to login with Demo User");
    } finally {
      setLoading(false);
    }
  };

  // 將匿名帳戶連結到 Google 帳戶
  // const linkAnonymousToGoogle = async (): Promise<void> => {
  //   if (!auth.currentUser) return;
    
  //   const provider = new GoogleAuthProvider();
  //   try {
  //     setLoading(true);
  //     await linkWithPopup(auth.currentUser, provider);
  //     toast.success("Account linked to Google!");
  //   } catch (error) {
  //     console.error("Error linking account:", error);
  //     toast.error("Failed to link account");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const addPost = async (content: string, image: string | null): Promise<void> => {
    if (!auth.currentUser) {
      toast.error("You must be logged in to post");
      return;
    }

    try {
      const newPost = {
        content,
        image,
        likes: 0,
        likedBy: [], 
        comments: [],
        tags: content.match(/#\w+/g) || [],
        user: { 
          id: auth.currentUser.uid, 
          name: userName, 
          avatar: userAvatar 
        },
        timestamp: Date.now(),
      };
      await addDoc(collection(db, "posts"), newPost);
      toast.success("Post added!");
    } catch (error) {
      console.error("Error adding post:", error);
      toast.error("Failed to add post");
    }
  };

  const addComment = async (id: string, commentText: string): Promise<void> => {
    if (!auth.currentUser) {
      toast.error("You must be logged in to comment");
      return;
    }

    try {
      const postRef = doc(db, "posts", id);
      const post = posts.find((p) => p.id === id);
      
      if (!post) {
        toast.error("Post not found");
        return;
      }

      const newComment: Comment = {
        text: commentText,
        user: { 
          id: auth.currentUser.uid, 
          name: userName, 
          avatar: userAvatar 
        },
        timestamp: Date.now(),
        replies: [],
      };
      
      await updateDoc(postRef, {
        comments: [...post.comments, newComment],
      });
      toast("New comment!", { icon: "💬" });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const addReply = async (postId: string, commentIdx: number, replyText: string): Promise<void> => {
    if (!auth.currentUser) {
      toast.error("You must be logged in to reply");
      return;
    }

    try {
      const postRef = doc(db, "posts", postId);
      const post = posts.find((p) => p.id === postId);
      
      if (!post || !post.comments[commentIdx]) {
        toast.error("Comment not found");
        return;
      }

      const updatedComments = [...post.comments];
      const newReply: Reply = {
        text: replyText,
        user: { 
          id: auth.currentUser.uid, 
          name: userName, 
          avatar: userAvatar 
        },
        timestamp: Date.now(),
      };
      
      updatedComments[commentIdx].replies = [
        ...(updatedComments[commentIdx].replies || []), 
        newReply
      ];
      
      await updateDoc(postRef, { comments: updatedComments });
      toast("Reply added!", { icon: "💬" });
    } catch (error) {
      console.error("Error adding reply:", error);
      toast.error("Failed to add reply");
    }
  };

  const likePost = async (id: string): Promise<void> => {
    if (!auth.currentUser) {
      toast.error("You must be logged in to like posts");
      return;
    }

    try {
      const uid = auth.currentUser.uid;
      const postRef = doc(db, "posts", id);
      const post = posts.find((p) => p.id === id);

      if (!post) {
        toast.error("Post not found");
        return;
      }

      const likedBy = post.likedBy || [];
      let newLikedBy: string[];
      let newLikes: number;
      
      if (likedBy.includes(uid)) {
        // 取消讚
        newLikedBy = likedBy.filter(userId => userId !== uid);
        newLikes = newLikedBy.length;
        toast("Unliked 💔");
      } else {
        // 加讚
        newLikedBy = [...likedBy, uid];
        newLikes = newLikedBy.length;
        toast("Liked ❤️");
      }

      // 直接更新整個陣列，確保同步
      await updateDoc(postRef, {
        likes: newLikes,
        likedBy: newLikedBy,
      });
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Failed to like post");
    }
  };

  const deletePost = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, "posts", id));
      toast("Post deleted", { icon: "🗑️" });
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  const editPost = async (id: string, newContent: string): Promise<void> => {
    try {
      const postRef = doc(db, "posts", id);
      await updateDoc(postRef, {
        content: newContent,
        tags: newContent.match(/#\w+/g) || [],
      });
      toast.success("Post updated!");
    } catch (error) {
      console.error("Error editing post:", error);
      toast.error("Failed to edit post");
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setPosts([]);
      setDropdownOpen(false);
      toast.success("Logged out!");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  const handleProfileUpdate = async (newName: string, newAvatar: string): Promise<void> => {
    if (!auth.currentUser) return;

    try {
      await updateProfile(auth.currentUser, {
        displayName: newName,
        photoURL: newAvatar,
      });
      setUserName(newName);
      setUserAvatar(newAvatar);
      localStorage.setItem("userName", newName);
      localStorage.setItem("userAvatar", newAvatar);
      setModalOpen(false);
      setDropdownOpen(false);
      toast.success("Profile updated!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearch(e.target.value);
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.content?.toLowerCase().includes(search.toLowerCase()) ||
      post.tags?.some((tag) => tag?.toLowerCase().includes(search.toLowerCase()))
  );

  const deleteComment = async (postId: string, commentIdx: number): Promise<void> => {
    try {
      const postRef = doc(db, "posts", postId);
      const post = posts.find((p) => p.id === postId);
      
      if (!post) {
        toast.error("Post not found");
        return;
      }
  
      const updatedComments = post.comments.filter((_, idx) => idx !== commentIdx);
      
      await updateDoc(postRef, { comments: updatedComments });
      toast("Comment deleted", { icon: "🗑️" });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  const deleteReply = async (postId: string, commentIdx: number, replyIdx: number): Promise<void> => {
    try {
      const postRef = doc(db, "posts", postId);
      const post = posts.find((p) => p.id === postId);
      
      if (!post || !post.comments[commentIdx]) {
        toast.error("Comment not found");
        return;
      }
  
      const updatedComments = [...post.comments];
      const replies = updatedComments[commentIdx].replies || [];
      updatedComments[commentIdx].replies = replies.filter((_, idx) => idx !== replyIdx);
      
      await updateDoc(postRef, { comments: updatedComments });
      toast("Reply deleted", { icon: "🗑️" });
    } catch (error) {
      console.error("Error deleting reply:", error);
      toast.error("Failed to delete reply");
    }
  };
  

  // Loading 狀態
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="text-center text-red-500 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // 未登入狀態 - 登入頁面
  if (!auth.currentUser) {
    return (
      <div className={`flex flex-col items-center justify-center h-screen ${
        isDark ? "bg-gray-900 text-gray-100" : "bg-teal-50 text-gray-800"
      }`}>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-8"
        >
          Welcome to Social Snap
        </motion.h1>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <button
            onClick={handleDemoLogin}
            className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all font-medium"
          >
            🚀 Login as Demo User
          </button>
          
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-all flex items-center justify-center font-medium"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.344-7.574 7.439-7.574c1.84 0 3.525.652 4.826 1.729l3.347-3.347C18.326 1.385 15.39 0 12.24 0 5.517 0 0 5.517 0 12.24s5.517 12.24 12.24 12.24c6.419 0 11.925-4.5 11.925-11.925 0-1.057-.165-2.082-.475-3.055H12.24z"
              />
            </svg>
            Login with Google
          </button>
          
          <button
            onClick={handleAnonymousLogin}
            className="w-full bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition-all font-medium"
          >
            👤 Continue as Guest
          </button>
        </motion.div>
      </div>
    );
  }

  // 主頁面 - 已登入狀態
  return (
    <div className={`max-w-4xl mx-auto p-6 min-h-screen transition-colors duration-500 ${
      isDark ? "bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100" 
             : "bg-gradient-to-br from-teal-50 to-indigo-100 text-gray-800"
    }`}>
      <Toaster position="top-right" />
      
      {/* 標題列 */}
      <div className="flex justify-between items-center mb-8 relative">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-extrabold tracking-tight"
        >
          Social Snap
        </motion.h1>
        
        {/* 用戶下拉選單 */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-2 rounded-full bg-teal-500 text-white hover:bg-teal-600 transition-all duration-300 shadow-md"
          >
            {userAvatar ? (
              <img src={userAvatar} alt="Avatar" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center">
                <span className="text-xs font-bold text-white">A</span>
              </div>
            )}
            <span className="text-sm max-w-24 truncate">{userName}</span>
          </button>
          
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 overflow-hidden">
              {/* {auth.currentUser?.isAnonymous && (
                <button
                  onClick={linkAnonymousToGoogle}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-teal-100 transition-all duration-200"
                >
                  🔗 Link to Google
                </button>
              )} */}
              <button
                onClick={() => {
                  setModalOpen(true);
                  setDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-teal-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={auth.currentUser?.isAnonymous}
              >
                ✏️ Edit Profile
              </button>
              <button
                onClick={() => {
                  setIsDark(!isDark);
                  setDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-teal-100 transition-all duration-200"
              >
                {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-red-700 hover:bg-red-100 transition-all duration-200"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 個人檔案模態框 */}
      <ProfileModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        userName={userName}
        userAvatar={userAvatar}
        onUpdate={handleProfileUpdate}
      />

      {/* 搜尋欄 */}
      <input
        value={search}
        onChange={handleSearchChange}
        placeholder="Search posts or #tags..."
        className={`w-full p-3 mb-6 border rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all ${
          isDark ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400" 
            : "bg-white border-teal-200 text-gray-700 placeholder-gray-500"
        }`}
      />
      
      {/* 發文表單 */}
      {!auth.currentUser?.isAnonymous && <PostForm onPost={addPost} isDark={isDark} />}

      {/* 匿名用戶提示 */}
      {auth.currentUser?.isAnonymous && (
        <div className={`p-4 mb-6 rounded-lg border-2 border-dashed ${
          isDark ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-yellow-50 border-yellow-300 text-yellow-700"
        }`}>
          <p className="text-center">
            👤 You are browsing as a guest. Please login to post, like, and comment.
          </p>
        </div>
      )}


      {/* 貼文列表 */}
      <PostList
        posts={filteredPosts}
        onLike={auth.currentUser?.isAnonymous ? () => toast.error("Please login to like posts") : likePost}
        onComment={auth.currentUser?.isAnonymous ? () => toast.error("Please login to comment") : addComment}
        onReply={auth.currentUser?.isAnonymous ? () => toast.error("Please login to reply") : addReply}
        onDelete={auth.currentUser?.isAnonymous ? () => toast.error("Please login to delete posts") : deletePost}
        onEdit={auth.currentUser?.isAnonymous ? () => toast.error("Please login to edit posts") : editPost}
        isDark={isDark}
        onDeleteComment={deleteComment}
        onDeleteReply={deleteReply} 
      />
    </div>
  );
};

export default App;