import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { auth } from "../services/firebase";
import { updateProfile } from "firebase/auth";

const ProfileModal = ({ isOpen, onClose, userName, userAvatar, onUpdate }) => {
  const [editName, setEditName] = useState(userName);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      const newName = editName || userName;
      const newAvatar = `https://i.pravatar.cc/40?u=${newName}`;

      if (user) {
        await updateProfile(user, {
          displayName: newName,
          photoURL: newAvatar,
        });
      }

      localStorage.setItem("userName", newName);
      onUpdate(newName, newAvatar);
      toast.success("Profile updated!");
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-4 text-gray-800">Edit Profile</h2>
        <form onSubmit={handleSubmit}>
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="New name"
            className="w-full p-3 mb-4 border rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-700"
          />
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Avatar Preview:</label>
            <img src={editName ? `https://i.pravatar.cc/40?u=${editName}` : userAvatar} alt="Avatar" className="w-12 h-12 rounded-full" />
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 p-3 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-all duration-300 shadow-md"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 p-3 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-all duration-300 shadow-md"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProfileModal;