import React from 'react';
import { icons } from 'lucide-react';

type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type IconColor =
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'success'
    | 'warning'
    | 'error'
    | 'neutral'
    | 'foreground';

export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
    name: keyof typeof icons;
    size?: IconSize | number;
    color?: IconColor;
    absoluteStrokeWidth?: boolean;
    'data-testid'?: string;
    badge?: boolean | number;
    badgeColor?: 'primary' | 'error';
    animated?: boolean;
}

const sizeClasses: Record<IconSize, string> = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-12 h-12',
};

const colorClasses: Record<IconColor, string> = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
    neutral: 'text-neutral-500',
    foreground: 'text-foreground',
};

const badgeColorClasses = {
    primary: 'bg-primary border-white',
    error: 'bg-error border-white',
};

export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
    (
        {
            name,
            color = 'neutral',
            size = 'md',
            className,
            badge = false,
            badgeColor = 'error',
            animated = false,
            ...props
        },
        ref
    ) => {
        const LucideIcon = icons[name];

        if (!LucideIcon) {
            console.warn(`Icon "${name}" not found.`);
            return null;
        }

        const sizeClass = typeof size === 'number' ? '' : sizeClasses[size as IconSize];
        const colorClass = colorClasses[color as IconColor] ?? colorClasses.neutral;
        const badgeElement = badge && (
            <span
                className={`absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full border-2 text-[8px] font-bold text-white ${badgeColorClasses[badgeColor]}`}
            >
                {typeof badge === 'number' ? badge : ''}
            </span>
        );

        return (
            <span
                data-testid={props['data-testid'] || `icon-${name}`}
                className={`relative inline-flex items-center justify-center ${animated ? 'animate-pulse-glow' : ''}`}
            >
                <LucideIcon
                    ref={ref}
                    className={`${sizeClass} ${colorClass} ${className}`}
                    style={typeof size === 'number' ? { width: size, height: size } : {}}
                    {...props}
                />
                {badgeElement}
            </span>
        );
    }
);

Icon.displayName = 'Icon'; 