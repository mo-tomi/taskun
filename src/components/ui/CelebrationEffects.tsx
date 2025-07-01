import React, { useEffect, useState, useRef } from 'react';

interface CelebrationEffectsProps {
    isActive: boolean;
    onComplete?: () => void;
    style?: 'celebration' | 'checkbox' | 'star' | 'confetti' | 'pulse' | 'rainbow' | 'progress' | 'float' | 'rhythm';
    children?: React.ReactNode;
}

export function CelebrationEffects({
    isActive,
    onComplete,
    style = 'celebration',
    children
}: CelebrationEffectsProps) {
    const [isAnimating, setIsAnimating] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isActive && !isAnimating) {
            setIsAnimating(true);

            // アニメーション完了後のクリーンアップ
            const timeout = setTimeout(() => {
                setIsAnimating(false);
                onComplete?.();
            }, getAnimationDuration(style));

            return () => clearTimeout(timeout);
        }
    }, [isActive, isAnimating, style, onComplete]);

    const getAnimationDuration = (style: string): number => {
        switch (style) {
            case 'celebration': return 1000;
            case 'checkbox': return 600;
            case 'star': return 1200;
            case 'confetti': return 1000;
            case 'pulse': return 800;
            case 'rainbow': return 1500;
            case 'progress': return 1000;
            case 'float': return 2000;
            case 'rhythm': return 1200;
            default: return 1000;
        }
    };

    const getAnimationClass = (style: string): string => {
        switch (style) {
            case 'celebration': return 'task-completion-celebration';
            case 'checkbox': return 'checkbox-completion';
            case 'star': return 'star-burst';
            case 'confetti': return 'confetti-explosion';
            case 'pulse': return 'achievement-pulse';
            case 'rainbow': return 'rainbow-highlight';
            case 'progress': return 'progress-complete';
            case 'float': return 'float-celebration';
            case 'rhythm': return 'rhythm-pulse';
            default: return 'task-completion-celebration';
        }
    };

    return (
        <div
            ref={elementRef}
            className={`transition-all duration-300 ${isAnimating ? getAnimationClass(style) : ''}`}
        >
            {children}
        </div>
    );
}

// 🎊 コンフェッティパーティクル生成
interface ConfettiParticle {
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
    velocity: { x: number; y: number };
    rotation: number;
    life: number;
}

interface ConfettiExplosionProps {
    isActive: boolean;
    particleCount?: number;
    colors?: string[];
    onComplete?: () => void;
}

export function ConfettiExplosion({
    isActive,
    particleCount = 15,
    colors = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'],
    onComplete
}: ConfettiExplosionProps) {
    const [particles, setParticles] = useState<ConfettiParticle[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (isActive) {
            // パーティクル生成
            const newParticles: ConfettiParticle[] = Array.from({ length: particleCount }, (_, i) => ({
                id: i,
                x: 50, // 中央から開始
                y: 50,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 8 + 4,
                velocity: {
                    x: (Math.random() - 0.5) * 20,
                    y: Math.random() * -15 - 5
                },
                rotation: Math.random() * 360,
                life: 1
            }));

            setParticles(newParticles);

            // アニメーション
            const animateParticles = () => {
                setParticles(prev =>
                    prev.map(particle => ({
                        ...particle,
                        x: particle.x + particle.velocity.x,
                        y: particle.y + particle.velocity.y,
                        velocity: {
                            x: particle.velocity.x * 0.98,
                            y: particle.velocity.y + 0.5 // 重力
                        },
                        rotation: particle.rotation + 5,
                        life: particle.life - 0.02
                    })).filter(particle => particle.life > 0)
                );
            };

            const interval = setInterval(animateParticles, 16);

            setTimeout(() => {
                clearInterval(interval);
                setParticles([]);
                onComplete?.();
            }, 2000);

            return () => clearInterval(interval);
        }
    }, [isActive, particleCount, colors, onComplete]);

    if (!isActive || particles.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            {particles.map(particle => (
                <div
                    key={particle.id}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        backgroundColor: particle.color,
                        transform: `rotate(${particle.rotation}deg) scale(${particle.life})`,
                        opacity: particle.life,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                    }}
                />
            ))}
        </div>
    );
}

// 🌟 成果バッジ
interface AchievementBadgeProps {
    type: 'first-task' | 'streak' | 'perfect-day' | 'speedster' | 'focused';
    isVisible: boolean;
    onClose?: () => void;
}

export function AchievementBadge({ type, isVisible, onClose }: AchievementBadgeProps) {
    const getBadgeConfig = () => {
        switch (type) {
            case 'first-task':
                return {
                    emoji: '🎯',
                    title: '初回達成',
                    description: '最初のタスクを完了しました！',
                    color: 'from-blue-500 to-purple-500'
                };
            case 'streak':
                return {
                    emoji: '🔥',
                    title: '連続達成',
                    description: '3日連続でタスクを完了！',
                    color: 'from-orange-500 to-red-500'
                };
            case 'perfect-day':
                return {
                    emoji: '✨',
                    title: '完璧な一日',
                    description: '今日のタスクを全て完了！',
                    color: 'from-green-500 to-teal-500'
                };
            case 'speedster':
                return {
                    emoji: '⚡',
                    title: 'スピードマスター',
                    description: '予定より早く完了！',
                    color: 'from-yellow-500 to-orange-500'
                };
            case 'focused':
                return {
                    emoji: '🧘',
                    title: '集中マスター',
                    description: '2時間以上集中しました！',
                    color: 'from-purple-500 to-pink-500'
                };
        }
    };

    const config = getBadgeConfig();

    if (!isVisible) return null;

    return (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
            <div className={`bg-gradient-to-r ${config.color} text-white p-4 rounded-2xl shadow-2xl min-w-64`}>
                <div className="flex items-center space-x-3">
                    <div className="text-3xl animate-bounce-gentle">
                        {config.emoji}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg">{config.title}</h3>
                        <p className="text-sm opacity-90">{config.description}</p>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white text-xl"
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// 🎵 サウンドエフェクト（オプション）
export function useCelebrationSound(enabled: boolean = true) {
    const playSound = (type: 'complete' | 'achievement' | 'streak') => {
        if (!enabled) return;

        // Web Audio API を使用した簡単なサウンド生成
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

        const frequencies = {
            complete: [523.25, 659.25, 783.99], // C5, E5, G5
            achievement: [261.63, 329.63, 392.00, 523.25], // C4, E4, G4, C5
            streak: [440, 554.37, 659.25, 880] // A4, C#5, E5, A5
        };

        frequencies[type].forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
            }, index * 100);
        });
    };

    return { playSound };
}

export default CelebrationEffects; 