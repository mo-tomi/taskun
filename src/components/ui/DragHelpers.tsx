import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Move, Clock, ArrowUpDown, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, MousePointer, Hand } from 'lucide-react';

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

interface DragHelpersProps {
    isDragging: boolean;
    dragType: 'task' | 'resize' | 'reorder' | null;
    canDrop?: boolean;
    dropZoneActive?: boolean;
    children?: React.ReactNode;
}

const DragHelpers: React.FC<DragHelpersProps> = ({
    isDragging,
    dragType,
    canDrop = false,
    dropZoneActive = false,
    children
}) => {
    const [showGuide, setShowGuide] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (isDragging) {
            setShowGuide(true);

            const handleMouseMove = (e: MouseEvent) => {
                setMousePosition({ x: e.clientX, y: e.clientY });
            };

            document.addEventListener('mousemove', handleMouseMove);
            return () => document.removeEventListener('mousemove', handleMouseMove);
        } else {
            setTimeout(() => setShowGuide(false), 200);
        }
    }, [isDragging]);

    const getGuidanceText = () => {
        switch (dragType) {
            case 'task':
                return 'タスクを別の時間スロットにドロップして移動';
            case 'resize':
                return 'ドラッグしてタスクの長さを調整';
            case 'reorder':
                return 'ドラッグして順序を変更';
            default:
                return 'ドラッグして移動';
        }
    };

    const getIconForDragType = () => {
        switch (dragType) {
            case 'task':
                return <Move className="w-4 h-4" />;
            case 'resize':
                return <ArrowUp className="w-4 h-4" />;
            case 'reorder':
                return <Hand className="w-4 h-4" />;
            default:
                return <MousePointer className="w-4 h-4" />;
        }
    };

    return (
        <>
            {children}

            {/* ドラッグガイドライン */}
            <AnimatePresence>
                {showGuide && isDragging && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 pointer-events-none z-50"
                    >
                        {/* マウスカーソル追従ガイド */}
                        <motion.div
                            style={{
                                left: mousePosition.x + 10,
                                top: mousePosition.y - 30
                            }}
                            className="absolute bg-black/80 text-white text-xs py-2 px-3 rounded-lg shadow-lg flex items-center space-x-2 backdrop-blur-sm"
                        >
                            {getIconForDragType()}
                            <span>{getGuidanceText()}</span>
                        </motion.div>

                        {/* グリッドガイドライン（タスクドラッグ時） */}
                        {dragType === 'task' && (
                            <div className="absolute inset-0 bg-blue-500/5">
                                <div className="relative h-full w-full">
                                    {/* 時間グリッドライン */}
                                    {Array.from({ length: 24 }, (_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.3 }}
                                            className="absolute left-0 right-0 border-t border-dashed border-blue-400"
                                            style={{
                                                top: `${(i / 24) * 100}%`
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ドロップゾーンヒント */}
                        {canDrop && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center space-x-2"
                            >
                                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                                <span>ここにドロップできます</span>
                            </motion.div>
                        )}

                        {/* アクティブドロップゾーン */}
                        {dropZoneActive && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute inset-4 border-2 border-dashed border-green-400 bg-green-50/50 dark:bg-green-900/20 rounded-lg"
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

// ホバー強化コンポーネント
interface EnhancedHoverProps {
    children: React.ReactNode;
    hoverContent?: React.ReactNode;
    delay?: number;
    position?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
    disabled?: boolean;
}

export const EnhancedHover: React.FC<EnhancedHoverProps> = ({
    children,
    hoverContent,
    delay = 100,
    position = 'top',
    className = '',
    disabled = false
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        if (isHovered && !disabled) {
            const timer = setTimeout(() => setShowContent(true), delay);
            return () => clearTimeout(timer);
        } else {
            setShowContent(false);
        }
    }, [isHovered, delay, disabled]);

    const getPositionClasses = () => {
        switch (position) {
            case 'top':
                return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
            case 'bottom':
                return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
            case 'left':
                return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
            case 'right':
                return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
        }
    };

    return (
        <div
            className={`relative ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {children}

            <AnimatePresence>
                {showContent && hoverContent && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        className={`
              absolute z-30 pointer-events-none
              ${getPositionClasses()}
            `}
                    >
                        <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs py-2 px-3 rounded-lg shadow-lg max-w-xs">
                            {hoverContent}

                            {/* ツールチップの矢印 */}
                            <div className={`
                absolute w-2 h-2 bg-gray-900 dark:bg-gray-100 transform rotate-45
                ${position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' : ''}
                ${position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1' : ''}
                ${position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1' : ''}
                ${position === 'right' ? 'right-full top-1/2 -translate-y-1/2 -mr-1' : ''}
              `} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// クリック効果の強化
interface ClickEffectProps {
    children: React.ReactNode;
    rippleColor?: string;
    className?: string;
}

export const ClickEffect: React.FC<ClickEffectProps> = ({
    children,
    rippleColor = 'rgba(59, 130, 246, 0.5)',
    className = ''
}) => {
    const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();

        setRipples(prev => [...prev, { id, x, y }]);

        // リップルを自動削除
        setTimeout(() => {
            setRipples(prev => prev.filter(ripple => ripple.id !== id));
        }, 600);
    };

    return (
        <div
            className={`relative overflow-hidden ${className}`}
            onMouseDown={handleClick}
        >
            {children}

            {/* リップルエフェクト */}
            {ripples.map(ripple => (
                <motion.div
                    key={ripple.id}
                    initial={{ scale: 0, opacity: 0.8 }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{
                        position: 'absolute',
                        left: ripple.x,
                        top: ripple.y,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: rippleColor,
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none'
                    }}
                />
            ))}
        </div>
    );
};

export default DragHelpers; 