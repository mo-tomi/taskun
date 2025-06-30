import React from 'react';
import { Check, AlertCircle, RotateCw } from 'lucide-react';

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
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
    size = 'md',
    className = ''
}) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    return (
        <RotateCw
            className={`${sizeClasses[size]} animate-spin text-blue-600 ${className}`}
            strokeWidth={2}
        />
    );
};

// 🎯 成功アイコンコンポーネント
export const SuccessIcon: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
    size = 'md',
    className = ''
}) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    return (
        <div className={`${sizeClasses[size]} bg-green-500 rounded-full flex items-center justify-center animate-scale-in ${className}`}>
            <Check className="w-3/4 h-3/4 text-white" strokeWidth={3} />
        </div>
    );
};

// ❌ エラーアイコンコンポーネント  
export const ErrorIcon: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
    size = 'md',
    className = ''
}) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    return (
        <div className={`${sizeClasses[size]} bg-red-500 rounded-full flex items-center justify-center animate-scale-in ${className}`}>
            <AlertCircle className="w-3/4 h-3/4 text-white" strokeWidth={2} />
        </div>
    );
};

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

export const TaskLoadingOverlay: React.FC<TaskLoadingOverlayProps> = ({
    state,
    taskTitle,
    className = ''
}) => {
    if (state === 'idle') return null;

    const getMessage = () => {
        switch (state) {
            case 'loading':
                return `「${taskTitle}」を更新中...`;
            case 'success':
                return `「${taskTitle}」を更新しました`;
            case 'error':
                return `更新に失敗しました`;
            default:
                return '';
        }
    };

    return (
        <div className={`
      absolute inset-0 
      bg-white/90 backdrop-blur-sm 
      rounded-lg 
      flex items-center justify-center 
      z-30
      animate-fade-in
      ${className}
    `}>
            <div className="text-center p-4">
                <LoadingStateDisplay
                    state={state}
                    message={getMessage()}
                    size="md"
                />
            </div>
        </div>
    );
};

// 🎯 フローティングトースト通知
export interface ToastNotificationProps {
    state: LoadingState;
    message: string;
    onDismiss?: () => void;
    autoHideDuration?: number;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
    state,
    message,
    onDismiss,
    autoHideDuration = 3000
}) => {
    React.useEffect(() => {
        if (state === 'success' && autoHideDuration > 0) {
            const timer = setTimeout(() => {
                onDismiss?.();
            }, autoHideDuration);
            return () => clearTimeout(timer);
        }
    }, [state, autoHideDuration, onDismiss]);

    if (state === 'idle') return null;

    const bgClasses = {
        loading: 'bg-blue-500',
        success: 'bg-green-500',
        error: 'bg-red-500'
    }[state] || 'bg-gray-500';

    return (
        <div className={`
      fixed top-4 right-4 
      ${bgClasses} text-white 
      px-4 py-3 rounded-lg shadow-lg 
      flex items-center space-x-3
      animate-slide-up
      z-50
      max-w-sm
    `}>
            <LoadingStateDisplay
                state={state}
                size="sm"
                inline
            />
            <span className="font-medium flex-1">{message}</span>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="text-white/80 hover:text-white ml-2"
                >
                    ×
                </button>
            )}
        </div>
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