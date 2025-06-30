import React from 'react';
import {
    // ナビゲーション
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    MoreHorizontal,

    // アクション
    Plus,
    Check,
    CheckCircle2,
    Play,
    Pause,
    SkipForward,
    RotateCcw,
    Trash2,

    // 状態・時間
    Clock,
    Timer,
    Calendar,
    Focus,
    Battery,
    Sliders,

    // データ・分析
    TrendingUp,
    BarChart3,
    Target,
    Flame,
    Heart,

    // UI要素
    Palette,
    Zap,
    Repeat,

    type LucideIcon
} from 'lucide-react';

// 🎨 アイコンサイズ定義
export const iconSizes = {
    xs: 'w-3 h-3',      // 12px
    sm: 'w-4 h-4',      // 16px  
    md: 'w-5 h-5',      // 20px
    lg: 'w-6 h-6',      // 24px
    xl: 'w-8 h-8',      // 32px
    '2xl': 'w-10 h-10', // 40px
} as const;

// 🎨 アイコンカラー定義
export const iconColors = {
    // プライマリ
    primary: 'text-blue-600',
    'primary-light': 'text-blue-500',
    'primary-dark': 'text-blue-700',

    // セカンダリ
    secondary: 'text-purple-600',
    'secondary-light': 'text-purple-500',
    'secondary-dark': 'text-purple-700',

    // アクセント
    accent: 'text-orange-600',
    'accent-light': 'text-orange-500',
    'accent-dark': 'text-orange-700',

    // ステータス
    success: 'text-green-600',
    warning: 'text-amber-600',
    error: 'text-red-600',

    // ニュートラル
    neutral: 'text-gray-600',
    'neutral-light': 'text-gray-500',
    'neutral-dark': 'text-gray-700',
    muted: 'text-gray-400',

    // 特殊
    white: 'text-white',
    current: 'text-current',
} as const;

// アイコンタイプ定義
export type IconSize = keyof typeof iconSizes;
export type IconColor = keyof typeof iconColors;

// アイコンプロパティ
export interface IconProps {
    size?: IconSize;
    color?: IconColor;
    className?: string;
    strokeWidth?: number;
}

// 統一されたアイコンコンポーネント
export const createIcon = (LucideComponent: LucideIcon) => {
    return React.forwardRef<SVGSVGElement, IconProps>(
        ({ size = 'md', color = 'current', className = '', strokeWidth = 2 }, ref) => {
            const sizeClass = iconSizes[size];
            const colorClass = iconColors[color];

            return (
                <LucideComponent
                    ref={ref}
                    className={`${sizeClass} ${colorClass} ${className}`}
                    strokeWidth={strokeWidth}
                />
            );
        }
    );
};

// 🎯 統一されたアイコンライブラリ
export const Icons = {
    // ナビゲーション
    ChevronLeft: createIcon(ChevronLeft),
    ChevronRight: createIcon(ChevronRight),
    Menu: createIcon(Menu),
    Close: createIcon(X),
    More: createIcon(MoreHorizontal),

    // アクション
    Add: createIcon(Plus),
    Check: createIcon(Check),
    CheckCircle: createIcon(CheckCircle2),
    Play: createIcon(Play),
    Pause: createIcon(Pause),
    Skip: createIcon(SkipForward),
    Reset: createIcon(RotateCcw),
    Delete: createIcon(Trash2),

    // 時間・状態
    Clock: createIcon(Clock),
    Timer: createIcon(Timer),
    Calendar: createIcon(Calendar),
    Focus: createIcon(Focus),
    Battery: createIcon(Battery),
    Sliders: createIcon(Sliders),

    // データ・分析
    TrendingUp: createIcon(TrendingUp),
    Chart: createIcon(BarChart3),
    Target: createIcon(Target),
    Flame: createIcon(Flame),
    Heart: createIcon(Heart),

    // UI要素
    Palette: createIcon(Palette),
    Zap: createIcon(Zap),
    Repeat: createIcon(Repeat),
} as const;

// アイコンバッジコンポーネント
export interface IconBadgeProps extends IconProps {
    icon: keyof typeof Icons;
    badge?: {
        content: string | number;
        color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
    };
}

export const IconBadge: React.FC<IconBadgeProps> = ({
    icon,
    badge,
    size = 'md',
    color = 'current',
    className = '',
    strokeWidth = 2
}) => {
    const IconComponent = Icons[icon];

    return (
        <div className={`relative inline-flex ${className}`}>
            <IconComponent
                size={size}
                color={color}
                strokeWidth={strokeWidth}
            />
            {badge && (
                <span className={`
          absolute -top-1 -right-1 
          min-w-[1.25rem] h-5 
          flex items-center justify-center 
          text-xs font-semibold rounded-full
          ${badge.color === 'primary' ? 'bg-blue-600 text-white' :
                        badge.color === 'secondary' ? 'bg-purple-600 text-white' :
                            badge.color === 'accent' ? 'bg-orange-600 text-white' :
                                badge.color === 'success' ? 'bg-green-600 text-white' :
                                    badge.color === 'warning' ? 'bg-amber-600 text-white' :
                                        badge.color === 'error' ? 'bg-red-600 text-white' :
                                            'bg-gray-600 text-white'
                    }
        `}>
                    {badge.content}
                </span>
            )}
        </div>
    );
};

// アニメーション付きアイコン
export interface AnimatedIconProps extends IconProps {
    icon: keyof typeof Icons;
    animation?: 'spin' | 'bounce' | 'pulse' | 'scale';
}

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({
    icon,
    animation,
    className = '',
    ...props
}) => {
    const IconComponent = Icons[icon];

    const animationClass = animation ? {
        spin: 'animate-spin',
        bounce: 'animate-bounce-gentle',
        pulse: 'animate-pulse',
        scale: 'animate-scale-in',
    }[animation] : '';

    return (
        <IconComponent
            className={`${animationClass} ${className}`}
            {...props}
        />
    );
};

// Export default Icons for convenience
export default Icons; 