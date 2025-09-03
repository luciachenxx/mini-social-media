import React from "react";
import { motion } from "framer-motion";

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    type: 'post' | 'comment' | 'reply';
    isDark: boolean;
    title?: string;
    message?: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
    isOpen,
    onConfirm,
    onCancel,
    type,
    isDark,
    title,
    message
}) => {
    if (!isOpen) return null;

    const getDefaultTitle = (): string => {
        switch (type) {
            case 'post': return 'Delete Post';
            case 'comment': return 'Delete Comment';
            case 'reply': return 'Delete Reply';
            default: return 'Delete Item';
        }
    };

    const getDefaultMessage = (): string => {
        switch (type) {
            case 'post': return 'Are you sure you want to delete this post? All comments and replies will be permanently removed.';
            case 'comment': return 'Are you sure you want to delete this comment? All replies to this comment will also be removed.';
            case 'reply': return 'Are you sure you want to delete this reply?';
            default: return 'Are you sure you want to delete this item?';
        }
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>): void => {
        if (e.target === e.currentTarget) {
            onCancel();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent): void => {
        if (e.key === 'Escape') {
            onCancel();
        } else if (e.key === 'Enter') {
            onConfirm();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleBackdropClick}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`p-6 rounded-xl shadow-2xl max-w-md mx-4 w-full ${isDark ? "bg-gray-800 text-gray-100 border border-gray-700" : "bg-white text-gray-800 border border-gray-200"
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <svg
                            className="w-6 h-6 text-red-600"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold">
                        {title || getDefaultTitle()}
                    </h3>
                </div>

                {/* Content */}
                <div className="mb-6">
                    <p className="text-sm leading-relaxed mb-3">
                        {message || getDefaultMessage()}
                    </p>
                    <div className={`p-3 rounded-lg ${isDark ? "bg-red-900 bg-opacity-30 border border-red-800" : "bg-red-50 border border-red-200"
                        }`}>
                        <p className="text-xs text-red-600 font-medium">
                            ⚠️ This action cannot be undone
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${isDark
                                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                    >
                        Delete {type}
                    </button>
                </div>

                {/* Keyboard shortcuts hint */}
                <div className="mt-4 text-center">
                    <p className="text-xs opacity-60">
                        Press ESC to cancel, Enter to delete
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default ConfirmDeleteModal;