import React, { useState, FormEvent, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { auth } from "../services/firebase";
import { updateProfile } from "firebase/auth";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userAvatar: string;
  onUpdate: (newName: string, newAvatar: string) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  userName, 
  userAvatar, 
  onUpdate 
}) => {
  const [editName, setEditName] = useState<string>(userName);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 當 modal 開啟時重置編輯狀態
  useEffect(() => {
    if (isOpen) {
      setEditName(userName);
    }
  }, [isOpen, userName]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setEditName(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!editName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      setIsLoading(true);
      const user = auth.currentUser;
      
      if (!user) {
        toast.error("User not authenticated");
        return;
      }

      const newName = editName.trim();
      const newAvatar = user.isAnonymous 
        ? "" // 匿名用戶不使用頭像
        : `https://i.pravatar.cc/40?u=${encodeURIComponent(newName)}`;

      await updateProfile(user, {
        displayName: newName,
        photoURL: newAvatar,
      });

      localStorage.setItem("userName", newName);
      if (newAvatar) {
        localStorage.setItem("userAvatar", newAvatar);
      }

      onUpdate(newName, newAvatar);
      toast.success("Profile updated!");
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = (): void => {
    if (!isLoading) {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  // 預覽頭像 URL
  // const previewAvatar = userAvatar ? userAvatar : `https://i.pravatar.cc/40?u=${encodeURIComponent(editName.trim())}`


  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-gray-800">Edit Profile</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name-input" className="block text-gray-700 mb-2 text-sm font-medium">
              Display Name
            </label>
            <input
              id="name-input"
              type="text"
              value={editName}
              onChange={handleInputChange}
              placeholder="Enter your name"
              maxLength={50}
              disabled={isLoading}
              className="w-full p-3 border rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
            />
            <div className="mt-1 text-xs text-gray-500">
              {editName.length}/50 characters
            </div>
          </div>

          {/* 頭像預覽 - 只對非匿名用戶顯示 */}
          {/* {!auth.currentUser?.isAnonymous && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 text-sm font-medium">
                Avatar Preview
              </label>
              <div className="flex items-center space-x-3">
                <img 
                  src={previewAvatar} 
                  alt="Avatar preview" 
                  className="w-12 h-12 rounded-full border-2 border-gray-200" 
                />
                <span className="text-sm text-gray-600">
                  Generated from your name
                </span>
              </div>
            </div>
          )} */}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading || !editName.trim()}
              className="flex-1 p-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-md font-medium"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg 
                    className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Updating...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 p-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-md font-medium"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* 匿名用戶提示 */}
        {auth.currentUser?.isAnonymous && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">
              💡 You're using a guest account. Consider linking to Google for a persistent profile.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProfileModal;