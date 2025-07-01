import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, XCircle, X, Undo2, Redo2 } from 'lucide-react';

export type FeedbackType = 'success' | 'error' | 'warning' | 'info';

export interface FeedbackItem {
    id: string;
    type: FeedbackType;
    title: string;
    message: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
    undoAction?: () => void;
}

interface FeedbackSystemProps {
    feedbacks: FeedbackItem[];
    onDismiss: (id: string) => void;
    onUndo?: (id: string) => void;
}

const FeedbackSystem: React.FC<FeedbackSystemProps> = ({
    feedbacks,
    onDismiss,
    onUndo
}) => {
    const getIcon = (type: FeedbackType) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'error':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-yellow-500" />;
            case 'info':
                return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getColorClasses = (type: FeedbackType) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
            case 'error':
                return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
            case 'warning':
                return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
            case 'info':
                return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
        }
    };

    useEffect(() => {
        feedbacks.forEach(feedback => {
            if (feedback.duration && feedback.duration > 0) {
                const timer = setTimeout(() => {
                    onDismiss(feedback.id);
                }, feedback.duration);

                return () => clearTimeout(timer);
            }
        });
    }, [feedbacks, onDismiss]);

    return (
        <div className="fixed top-4 right-4 z-40 space-y-2 max-w-sm">
            <AnimatePresence>
                {feedbacks.map((feedback) => (
                    <motion.div
                        key={feedback.id}
                        initial={{ opacity: 0, x: 300, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 300, scale: 0.9 }}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 25
                        }}
                        className={`
              ${getColorClasses(feedback.type)}
              border rounded-lg p-4 shadow-lg backdrop-blur-sm
              max-w-sm relative
            `}
                    >
                        <div className="flex items-start space-x-3">
                            {getIcon(feedback.type)}
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                    {feedback.title}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {feedback.message}
                                </p>

                                {/* アクションボタン */}
                                {(feedback.action || feedback.undoAction) && (
                                    <div className="flex items-center space-x-2 mt-3">
                                        {feedback.undoAction && (
                                            <button
                                                onClick={() => {
                                                    feedback.undoAction?.();
                                                    onDismiss(feedback.id);
                                                }}
                                                className="flex items-center space-x-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
                                            >
                                                <Undo2 className="w-3 h-3" />
                                                <span>元に戻す</span>
                                            </button>
                                        )}
                                        {feedback.action && (
                                            <button
                                                onClick={() => {
                                                    feedback.action?.onClick();
                                                    onDismiss(feedback.id);
                                                }}
                                                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                                            >
                                                {feedback.action.label}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => onDismiss(feedback.id)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* プログレスバー（自動消去の場合） */}
                        {feedback.duration && feedback.duration > 0 && (
                            <motion.div
                                className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-lg"
                                initial={{ width: '100%' }}
                                animate={{ width: '0%' }}
                                transition={{
                                    duration: feedback.duration / 1000,
                                    ease: 'linear'
                                }}
                            />
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

// フィードバック管理フック
export const useFeedback = () => {
    const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);

    const addFeedback = (feedback: Omit<FeedbackItem, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newFeedback: FeedbackItem = {
            ...feedback,
            id,
            duration: feedback.duration ?? 5000 // デフォルト5秒
        };
        setFeedbacks(prev => [...prev, newFeedback]);
        return id;
    };

    const removeFeedback = (id: string) => {
        setFeedbacks(prev => prev.filter(f => f.id !== id));
    };

    const clearAll = () => {
        setFeedbacks([]);
    };

    // 便利なヘルパー関数
    const showSuccess = (title: string, message: string, options?: Partial<FeedbackItem>) => {
        return addFeedback({ type: 'success', title, message, ...options });
    };

    const showError = (title: string, message: string, options?: Partial<FeedbackItem>) => {
        return addFeedback({ type: 'error', title, message, duration: 10000, ...options });
    };

    const showWarning = (title: string, message: string, options?: Partial<FeedbackItem>) => {
        return addFeedback({ type: 'warning', title, message, ...options });
    };

    const showInfo = (title: string, message: string, options?: Partial<FeedbackItem>) => {
        return addFeedback({ type: 'info', title, message, ...options });
    };

    return {
        feedbacks,
        addFeedback,
        removeFeedback,
        clearAll,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        FeedbackSystem: () => (
            <FeedbackSystem
                feedbacks={feedbacks}
                onDismiss={removeFeedback}
            />
        )
    };
}; 