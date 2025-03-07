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
} from "firebase/firestore";
import {
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  linkWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import PostForm from "./components/PostForm";
import PostList from "./components/PostList";
import ProfileModal from "./components/ProfileModal";

const App = () => {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true); // 控制整體載入狀態
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let unsubscribePosts = null;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        // 更新用戶資料
        const name = user.displayName || (user.isAnonymous ? "Anonymous" : "User");
        const avatar =
          user.photoURL || `https://i.pravatar.cc/40?u=${user.uid || Date.now()}`;
        setUserName(name);
        setUserAvatar(avatar);
        localStorage.setItem("userName", name);
        localStorage.setItem("userAvatar", avatar);

        // 只有在用戶登入後才開始監聽 Firestore
        unsubscribePosts = onSnapshot(
          collection(db, "posts"),
          (snapshot) => {
            const postsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setPosts(postsData);
            setError(null);
            setLoading(false); // 資料載入完成
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
        setLoading(false); // 未登入時也結束載入
        if (unsubscribePosts) unsubscribePosts(); // 清理監聽
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribePosts) unsubscribePosts();
    };
  }, []); // 空依賴陣列，僅在組件初次掛載時運行

  // 匿名登入
  const handleAnonymousLogin = async () => {
    try {
      setLoading(true); // 開始載入
      await signInAnonymously(auth);
      toast.success("Logged in anonymously!");
    } catch (error) {
      console.error("Anonymous login error:", error);
      toast.error("Failed to login anonymously");
      setLoading(false);
    }
  };

  // Google 登入
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true); // 開始載入
      await signInWithPopup(auth, provider);
      toast.success("Logged in with Google!");
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Failed to login with Google");
      setLoading(false);
    }
  };

  // 將匿名帳戶連結到 Google 帳戶
  const linkAnonymousToGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true); // 開始載入
      await linkWithPopup(auth.currentUser, provider);
      toast.success("Account linked to Google!");
    } catch (error) {
      console.error("Error linking account:", error);
      toast.error("Failed to link account");
      setLoading(false);
    }
  };

  const addPost = async (content, image) => {
    try {
      const newPost = {
        content,
        image,
        likes: 0,
        comments: [],
        tags: content.match(/#\w+/g) || [],
        user: { id: auth.currentUser?.uid || Date.now(), name: userName, avatar: userAvatar },
        timestamp: Date.now(),
      };
      await addDoc(collection(db, "posts"), newPost);
      toast.success("Post added!");
    } catch (error) {
      console.error("Error adding post:", error);
      toast.error("Failed to add post");
    }
  };

  const addComment = async (id, commentText) => {
    try {
      const postRef = doc(db, "posts", id);
      const post = posts.find((p) => p.id === id);
      const newComment = {
        text: commentText,
        user: { id: auth.currentUser?.uid || Date.now(), name: userName, avatar: userAvatar },
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

  const addReply = async (postId, commentIdx, replyText) => {
    try {
      const postRef = doc(db, "posts", postId);
      const post = posts.find((p) => p.id === postId);
      const updatedComments = [...post.comments];
      const newReply = {
        text: replyText,
        user: { id: auth.currentUser?.uid || Date.now(), name: userName, avatar: userAvatar },
        timestamp: Date.now(),
      };
      updatedComments[commentIdx].replies = [...(updatedComments[commentIdx].replies || []), newReply];
      await updateDoc(postRef, { comments: updatedComments });
      toast("Reply added!", { icon: "💬" });
    } catch (error) {
      console.error("Error adding reply:", error);
      toast.error("Failed to add reply");
    }
  };

  const likePost = async (id) => {
    try {
      const postRef = doc(db, "posts", id);
      const post = posts.find((p) => p.id === id);
      await updateDoc(postRef, { likes: post.likes + 1 });
      toast("Liked!", { icon: "❤️" });
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Failed to like post");
    }
  };

  const deletePost = async (id) => {
    try {
      await deleteDoc(doc(db, "posts", id));
      toast("Post deleted", { icon: "🗑️" });
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  const editPost = async (id, newContent) => {
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

  const handleLogout = async () => {
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

  const handleProfileUpdate = async (newName, newAvatar) => {
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

  const filteredPosts = posts.filter(
    (post) =>
      (post.content?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (post.tags || []).some((tag) => (tag?.toLowerCase() || "").includes(search.toLowerCase()))
  );

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

  if (error) return <div className="text-center text-red-500">{error}</div>;

  // 未登入時顯示登入頁面
  if (!auth.currentUser) {
    return (
      <div
        className={`flex flex-col items-center justify-center h-screen ${isDark ? "bg-gray-900 text-gray-100" : "bg-teal-50 text-gray-800"
          }`}
      >
        <h1 className="text-4xl font-bold mb-8">Welcome to Social Snap</h1>
        <button
          onClick={handleAnonymousLogin}
          className="mb-4 bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition-all"
        >
          Login Anonymously
        </button>
        <button
          onClick={handleGoogleLogin}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-all flex items-center"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.344-7.574 7.439-7.574c1.84 0 3.525.652 4.826 1.729l3.347-3.347C18.326 1.385 15.39 0 12.24 0 5.517 0 0 5.517 0 12.24s5.517 12.24 12.24 12.24c6.419 0 11.925-4.5 11.925-11.925 0-1.057-.165-2.082-.475-3.055H12.24z"
            />
          </svg>
          Login with Google
        </button>
      </div>
    );
  }

  // 已登入時顯示主頁
  return (
    <div
      className={`max-w-4xl mx-auto p-6 min-h-screen transition-colors duration-500 ${isDark ? "bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100" : "bg-gradient-to-br from-teal-50 to-indigo-100 text-gray-800"
        }`}
    >
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-8 relative">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-extrabold tracking-tight"
        >
          Social Snap
        </motion.h1>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-2 rounded-full bg-teal-500 text-white hover:bg-teal-600 transition-all duration-300 shadow-md"
          >
            <img src={userAvatar} alt="Avatar" className="w-8 h-8 rounded-full" />
            <span>{userName}</span>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
              {auth.currentUser?.isAnonymous && (
                <button
                  onClick={linkAnonymousToGoogle}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-teal-100 transition-all duration-200"
                >
                  Link to Google
                </button>
              )}
              <button
                onClick={() => setModalOpen(true)}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-teal-100 transition-all duration-200"
                disabled={auth.currentUser?.isAnonymous}
              >
                Edit Profile
              </button>
              <button
                onClick={() => setIsDark(!isDark)}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-teal-100 transition-all duration-200"
              >
                {isDark ? "Light Mode" : "Dark Mode"}
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-red-700 hover:bg-red-100 transition-all duration-200"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <ProfileModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        userName={userName}
        userAvatar={userAvatar}
        onUpdate={handleProfileUpdate}
      />

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search posts or #tags..."
        className={`w-full p-3 mb-6 border rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all ${isDark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-teal-200 text-gray-700"
          }`}
      />
      <PostForm onPost={addPost} isDark={isDark} />
      <PostList
        posts={filteredPosts}
        onLike={likePost}
        onComment={addComment}
        onReply={addReply}
        onDelete={deletePost}
        onEdit={editPost}
        isDark={isDark}
      />
    </div>
  );
};

export default App;