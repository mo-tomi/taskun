import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './Icon';

// 🎯 ローディング状態の型定義
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface LoadingStateProps {
    state: LoadingState;
    message?: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    inline?: boolean;
}

// 🎨 ローディングスピナーコンポーネント
export const LoadingSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
        sm: 'w-5 h-5 border-2',
        md: 'w-8 h-8 border-4',
        lg: 'w-12 h-12 border-4',
    };
    return (
        <div
            className={`animate-spin rounded-full border-primary border-t-transparent ${sizeClasses[size]}`}
            role="status"
        />
    );
};

// 🎯 成功アイコンコンポーネント
export const SuccessIcon = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => (
    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
        <Icon name="CheckCircle2" size={size} color="success" />
    </motion.div>
);

// ❌ エラーアイコンコンポーネント  
export const ErrorIcon = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => (
    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
        <Icon name="XCircle" size={size} color="error" />
    </motion.div>
);

// 🎭 メインのローディング状態コンポーネント
export const LoadingStateDisplay: React.FC<LoadingStateProps> = ({
    state,
    message,
    className = '',
    size = 'md',
    inline = false
}) => {
    if (state === 'idle') return null;

    const baseClasses = inline
        ? 'inline-flex items-center space-x-2'
        : 'flex items-center justify-center space-x-2 p-4';

    const renderIcon = () => {
        switch (state) {
            case 'loading':
                return <LoadingSpinner size={size} />;
            case 'success':
                return <SuccessIcon size={size} />;
            case 'error':
                return <ErrorIcon size={size} />;
            default:
                return null;
        }
    };

    const renderMessage = () => {
        if (!message) return null;

        const textClasses = {
            loading: 'text-blue-600',
            success: 'text-green-600',
            error: 'text-red-600'
        }[state] || 'text-gray-600';

        const sizeClasses = {
            sm: 'text-sm',
            md: 'text-base',
            lg: 'text-lg'
        }[size];

        return (
            <span className={`font-medium ${textClasses} ${sizeClasses}`}>
                {message}
            </span>
        );
    };

    return (
        <div className={`${baseClasses} ${className}`}>
            {renderIcon()}
            {renderMessage()}
        </div>
    );
};

// 🎨 タスク更新専用ローディングオーバーレイ
export interface TaskLoadingOverlayProps {
    state: LoadingState;
    taskTitle?: string;
    className?: string;
}

export const TaskLoadingOverlay = ({ state, taskTitle = 'タスク', className = '' }: TaskLoadingOverlayProps) => (
    <AnimatePresence>
        {state !== 'idle' && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg z-30 p-4 ${className}`}
            >
                {state === 'loading' && <LoadingSpinner size="md" />}
                {state === 'success' && <SuccessIcon size="lg" />}
                {state === 'error' && <ErrorIcon size="lg" />}
                <p className="mt-3 text-sm font-semibold text-center text-foreground">
                    {state === 'loading' && `「${taskTitle}」を更新中...`}
                    {state === 'success' && `「${taskTitle}」を更新しました！`}
                    {state === 'error' && `更新に失敗しました`}
                </p>
            </motion.div>
        )}
    </AnimatePresence>
);

// 🎯 フローティングトースト通知
export interface ToastNotificationProps {
    state: LoadingState;
    message: string;
    visible: boolean;
    onClose: () => void;
}

export const ToastNotification = ({ state, message, visible, onClose }: ToastNotificationProps) => {
    useEffect(() => {
        if (visible) {
            const timer = setTimeout(onClose, 3000);
            return () => clearTimeout(timer);
        }
    }, [visible, onClose]);

    const iconMap = {
        success: <Icon name="CheckCircle2" color="success" size="lg" />,
        error: <Icon name="AlertTriangle" color="error" size="lg" />,
        loading: <LoadingSpinner size="sm" />,
        idle: null,
    };

    return (
        <AnimatePresence>
            {visible && state !== 'idle' && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.3 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                    className="fixed bottom-5 right-5 w-full max-w-sm p-4 rounded-xl bg-white shadow-2xl border border-border z-50 flex items-start space-x-4"
                    role="alert"
                >
                    <div className="flex-shrink-0 pt-1">{iconMap[state]}</div>
                    <div className="flex-1">
                        <p className="font-semibold text-foreground">{message}</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-neutral-100">
                        <Icon name="X" size="sm" color="neutral" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// ⏳ ページ全体のローディング
export const PageLoadingOverlay: React.FC<{ message?: string }> = ({
    message = '読み込み中...'
}) => (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center p-8">
            <LoadingStateDisplay
                state="loading"
                message={message}
                size="lg"
            />
        </div>
    </div>
);

export default LoadingStateDisplay; 