import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { auth } from "../services/firebase";
import { signInAnonymously, updateProfile } from "firebase/auth";

const EntryPage = ({ onSubmit }) => {
  const [name, setName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (name.trim()) {
      try {
        const userCredential = await signInAnonymously(auth);
        await updateProfile(userCredential.user, {
          displayName: name.trim(),
          photoURL: `https://i.pravatar.cc/40?u=${name.trim()}`,
        });
        localStorage.setItem("userName", name.trim());
        onSubmit(name.trim());
      } catch (error) {
        console.error("Error signing in:", error);
        toast.error("Failed to sign in");
      }
    } else {
      toast.error("Please enter a name!");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-indigo-100">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-6 rounded-lg shadow-lg w-full">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Welcome to Social Snap</h2>
        <form onSubmit={handleSubmit}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full p-3 mb-4 border rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-700"
          />
          <button type="submit" className="w-full p-3 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-all duration-300 shadow-md">
            Start Snapping!
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default EntryPage;
