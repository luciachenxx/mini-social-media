import React, { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { auth } from "../../services/firebase";
import { signInAnonymously, updateProfile, UserCredential } from "firebase/auth";

interface EntryPageProps {
  onSubmit: (name: string) => void;
}

const EntryPage: React.FC<EntryPageProps> = ({ onSubmit }) => {
  const [name, setName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Please enter a name!");
      return;
    }

    try {
      setIsLoading(true);
      const userCredential: UserCredential = await signInAnonymously(auth);
      
      await updateProfile(userCredential.user, {
        displayName: name.trim(),
        photoURL: `https://i.pravatar.cc/40?u=${encodeURIComponent(name.trim())}`,
      });
      
      localStorage.setItem("userName", name.trim());
      onSubmit(name.trim());
      
      toast.success("Welcome to Social Snap! 🎉");
    } catch (error) {
      console.error("Error signing in:", error);
      toast.error("Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value);
  };

  return (
    <div className="max-w-md mx-auto p-6 min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-indigo-100">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white p-6 rounded-lg shadow-lg w-full"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">
          Welcome to Social Snap
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Enter your name to start sharing moments
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={name}
              onChange={handleInputChange}
              placeholder="Enter your name"
              className="w-full p-3 border rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-700 transition-all duration-200"
              disabled={isLoading}
              maxLength={50}
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading || !name.trim()}
            className="w-full p-3 bg-teal-500 text-white rounded-full hover:bg-teal-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-md font-medium"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg 
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
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
                Getting Ready...
              </span>
            ) : (
              "Start Snapping! 🚀"
            )}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            By continuing, you'll be signed in anonymously
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default EntryPage;