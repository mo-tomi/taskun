import React from 'react';
import { Move, Clock, ArrowUpDown } from 'lucide-react';

// 🎯 ドラッグ状態の型定義
export interface DragState {
    isDragging: boolean;
    draggedItemId: string | null;
    dragStartY: number;
    dragCurrentY: number;
    dragDelta: number;
    snapTarget: string | null;
}

// 🎨 ドラッグガイドライン
export interface DragGuidelineProps {
    visible: boolean;
    timeSlot: string;
    yPosition: number;
    isDragTarget: boolean;
}

export const DragGuideline: React.FC<DragGuidelineProps> = ({
    visible,
    timeSlot,
    yPosition,
    isDragTarget
}) => {
    if (!visible) return null;

    return (
        <div
            className={`
        absolute left-0 right-0 z-20 transition-all duration-200
        ${isDragTarget ? 'opacity-100' : 'opacity-60'}
      `}
            style={{ top: `${yPosition}px` }}
        >
            {/* ガイドライン */}
            <div className={`
        h-1 bg-blue-500 rounded-full
        ${isDragTarget ? 'animate-pulse shadow-lg' : ''}
        relative
      `}>
                {isDragTarget && (
                    <>
                        {/* パルス効果 */}
                        <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-50" />

                        {/* 時間表示 */}
                        <div className="absolute -top-8 left-4 bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold shadow-lg">
                            {timeSlot}
                        </div>

                        {/* ドロップゾーンインジケーター */}
                        <div className="absolute -left-2 -top-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
                        <div className="absolute -right-2 -top-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
                    </>
                )}
            </div>
        </div>
    );
};

// 📋 ドラッグプレビューカード
export interface DragPreviewProps {
    title: string;
    emoji: string;
    timeSlot: string;
    color: string;
    visible: boolean;
    x: number;
    y: number;
}

export const DragPreview: React.FC<DragPreviewProps> = ({
    title,
    emoji,
    timeSlot,
    color,
    visible,
    x,
    y
}) => {
    if (!visible) return null;

    const colorClasses = {
        coral: 'bg-red-100 border-red-300 text-red-700',
        blue: 'bg-blue-100 border-blue-300 text-blue-700',
        green: 'bg-green-100 border-green-300 text-green-700',
        purple: 'bg-purple-100 border-purple-300 text-purple-700',
        orange: 'bg-orange-100 border-orange-300 text-orange-700',
        teal: 'bg-teal-100 border-teal-300 text-teal-700'
    }[color] || 'bg-gray-100 border-gray-300 text-gray-700';

    return (
        <div
            className="fixed z-50 pointer-events-none animate-fade-in"
            style={{
                left: `${x + 20}px`,
                top: `${y - 10}px`,
                transform: 'rotate(2deg) scale(1.05)'
            }}
        >
            <div className={`
        p-3 rounded-lg border-2 shadow-xl backdrop-blur-sm
        ${colorClasses}
        max-w-xs
      `}>
                <div className="flex items-center space-x-2">
                    <span className="text-lg">{emoji}</span>
                    <div>
                        <div className="font-semibold text-sm truncate">{title}</div>
                        <div className="text-xs opacity-75">{timeSlot}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 🎯 ドラッグインジケーター（ハンドル）
export interface DragIndicatorProps {
    visible: boolean;
    position: 'top-right' | 'top-left' | 'center';
    pulse?: boolean;
}

export const DragIndicator: React.FC<DragIndicatorProps> = ({
    visible,
    position,
    pulse = false
}) => {
    if (!visible) return null;

    const positionClasses = {
        'top-right': 'absolute top-2 right-2',
        'top-left': 'absolute top-2 left-2',
        'center': 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
    }[position];

    return (
        <div className={`${positionClasses} z-10 ${pulse ? 'animate-pulse' : ''}`}>
            <div className="w-6 h-6 bg-blue-500 rounded-full shadow-lg flex items-center justify-center">
                <Move className="w-3 h-3 text-white" strokeWidth={2.5} />
            </div>
        </div>
    );
};

// ⏰ 時間スナップガイド
export interface TimeSnapGuideProps {
    visible: boolean;
    deltaMinutes: number;
    originalTime: string;
    newTime: string;
}

export const TimeSnapGuide: React.FC<TimeSnapGuideProps> = ({
    visible,
    deltaMinutes,
    originalTime,
    newTime
}) => {
    if (!visible) return null;

    const isForward = deltaMinutes > 0;
    const absMinutes = Math.abs(deltaMinutes);
    const hours = Math.floor(absMinutes / 60);
    const minutes = absMinutes % 60;

    const formatDelta = () => {
        const parts = [];
        if (hours > 0) parts.push(`${hours}時間`);
        if (minutes > 0) parts.push(`${minutes}分`);
        return parts.join('');
    };

    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up">
            <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl max-w-sm">
                <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <div>
                        <div className="text-sm font-semibold">
                            {isForward ? '⏩' : '⏪'} {formatDelta()}{isForward ? '後ろ' : '前'}に移動
                        </div>
                        <div className="text-xs text-gray-300">
                            {originalTime} → {newTime}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 📱 ドラッグヘルプメッセージ
export interface DragHelpMessageProps {
    visible: boolean;
    message: string;
    icon?: 'move' | 'time' | 'snap';
}

export const DragHelpMessage: React.FC<DragHelpMessageProps> = ({
    visible,
    message,
    icon = 'move'
}) => {
    if (!visible) return null;

    const IconComponent = {
        move: Move,
        time: Clock,
        snap: ArrowUpDown
    }[icon];

    return (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40 animate-bounce-gentle">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
                <IconComponent className="w-4 h-4" />
                <span className="text-sm font-medium">{message}</span>
            </div>
        </div>
    );
};

// 🎨 ドラッグエフェクト（波紋効果）
export interface DragRippleProps {
    visible: boolean;
    x: number;
    y: number;
}

export const DragRipple: React.FC<DragRippleProps> = ({ visible, x, y }) => {
    if (!visible) return null;

    return (
        <div
            className="fixed pointer-events-none z-30"
            style={{ left: `${x}px`, top: `${y}px` }}
        >
            <div className="relative">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-50 absolute transform -translate-x-1/2 -translate-y-1/2" />
                <div className="w-8 h-8 bg-blue-400 rounded-full animate-ping opacity-30 absolute transform -translate-x-1/2 -translate-y-1/2" style={{ animationDelay: '0.1s' }} />
                <div className="w-12 h-12 bg-blue-300 rounded-full animate-ping opacity-20 absolute transform -translate-x-1/2 -translate-y-1/2" style={{ animationDelay: '0.2s' }} />
            </div>
        </div>
    );
};

// 🎯 ドラッグ状態管理フック
export const useDragState = () => {
    const [dragState, setDragState] = React.useState<DragState>({
        isDragging: false,
        draggedItemId: null,
        dragStartY: 0,
        dragCurrentY: 0,
        dragDelta: 0,
        snapTarget: null
    });

    const startDrag = (itemId: string, startY: number) => {
        setDragState({
            isDragging: true,
            draggedItemId: itemId,
            dragStartY: startY,
            dragCurrentY: startY,
            dragDelta: 0,
            snapTarget: null
        });
    };

    const updateDrag = (currentY: number) => {
        setDragState(prev => ({
            ...prev,
            dragCurrentY: currentY,
            dragDelta: currentY - prev.dragStartY
        }));
    };

    const setSnapTarget = (target: string | null) => {
        setDragState(prev => ({ ...prev, snapTarget: target }));
    };

    const endDrag = () => {
        setDragState({
            isDragging: false,
            draggedItemId: null,
            dragStartY: 0,
            dragCurrentY: 0,
            dragDelta: 0,
            snapTarget: null
        });
    };

    return {
        dragState,
        startDrag,
        updateDrag,
        setSnapTarget,
        endDrag
    };
};

// 🛠️ ドラッグユーティリティ関数
export const dragUtils = {
    // 時間をY座標に変換
    timeToY: (time: string, startHour: number = 6) => {
        const [hours, minutes] = time.split(':').map(Number);
        return ((hours - startHour) * 64) + (minutes / 60 * 64);
    },

    // Y座標を時間に変換
    yToTime: (y: number, startHour: number = 6) => {
        const totalMinutes = Math.round((y / 64) * 60) + (startHour * 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    },

    // 15分単位にスナップ
    snapToQuarter: (minutes: number) => {
        return Math.round(minutes / 15) * 15;
    },

    // ドラッグ可能な範囲をチェック
    isValidTimeRange: (startTime: string, endTime: string, minHour: number = 6, maxHour: number = 23) => {
        const startHour = parseInt(startTime.split(':')[0]);
        const endHour = parseInt(endTime.split(':')[0]);
        return startHour >= minHour && endHour <= maxHour && startTime < endTime;
    },

    // タスクの高さを計算
    calculateTaskHeight: (startTime: string, endTime: string) => {
        const startY = dragUtils.timeToY(startTime);
        const endY = dragUtils.timeToY(endTime);
        return endY - startY;
    }
};

export default DragGuideline; 