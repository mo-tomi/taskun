import React from 'react';
import { Plus, Zap, Calendar, Clock, Target, CheckCircle2, Star } from 'lucide-react';

interface EmptyStateProps {
    type: 'tasks' | 'todos' | 'timeline' | 'habits';
    onAction?: () => void;
    actionLabel?: string;
}

export function EmptyState({ type, onAction, actionLabel }: EmptyStateProps) {
    const getEmptyStateConfig = () => {
        switch (type) {
            case 'tasks':
                return {
                    icon: Target,
                    title: '✨ 今日のタスクを始めましょう',
                    description: '新しいタスクを追加して、効率的な一日をスタート！',
                    illustration: (
                        <div className="relative">
                            {/* メインイラスト */}
                            <div className="w-32 h-32 mx-auto mb-4 relative animate-float">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-50 animate-pulse"></div>
                                <div className="absolute inset-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                    <Target className="w-12 h-12 text-white animate-bounce-gentle" />
                                </div>

                                {/* 浮遊する要素 */}
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce-gentle opacity-80" style={{ animationDelay: '0.5s' }}></div>
                                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-green-400 rounded-full animate-bounce-gentle opacity-60" style={{ animationDelay: '1s' }}></div>
                                <div className="absolute top-1/2 -left-4 w-3 h-3 bg-pink-400 rounded-full animate-bounce-gentle opacity-70" style={{ animationDelay: '1.5s' }}></div>
                            </div>

                            {/* 軌道エフェクト */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-dashed border-blue-200 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
                        </div>
                    ),
                    actionIcon: Plus,
                    gradientFrom: 'from-blue-500',
                    gradientTo: 'to-purple-500'
                };

            case 'todos':
                return {
                    icon: CheckCircle2,
                    title: '📝 アイデアを形にしよう',
                    description: 'すべてのタスクと計画をここで管理できます',
                    illustration: (
                        <div className="relative">
                            <div className="w-28 h-28 mx-auto mb-4 relative">
                                {/* ノートブックイラスト */}
                                <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-teal-100 rounded-2xl rotate-3 animate-float"></div>
                                <div className="absolute inset-1 bg-white rounded-xl border border-gray-200 shadow-lg">
                                    <div className="p-3 space-y-2">
                                        <div className="w-full h-2 bg-gray-100 rounded animate-pulse"></div>
                                        <div className="w-3/4 h-2 bg-gray-100 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-1/2 h-2 bg-gray-100 rounded animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                                <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce-gentle">
                                    <Plus className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        </div>
                    ),
                    actionIcon: Plus,
                    gradientFrom: 'from-green-500',
                    gradientTo: 'to-teal-500'
                };

            case 'timeline':
                return {
                    icon: Clock,
                    title: '⏰ 時間を有効活用しよう',
                    description: 'タスクをスケジュールして、生産性を最大化！',
                    illustration: (
                        <div className="relative">
                            <div className="w-32 h-32 mx-auto mb-4 relative">
                                {/* 時計イラスト */}
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-red-100 rounded-full animate-pulse"></div>
                                <div className="absolute inset-2 bg-white rounded-full border-4 border-orange-300 shadow-lg">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Clock className="w-12 h-12 text-orange-500 animate-bounce-gentle" />
                                    </div>

                                    {/* 時計の針 */}
                                    <div className="absolute top-1/2 left-1/2 w-0.5 h-6 bg-orange-500 origin-bottom transform -translate-x-1/2 -translate-y-full rotate-45 animate-spin" style={{ animationDuration: '10s' }}></div>
                                    <div className="absolute top-1/2 left-1/2 w-0.5 h-4 bg-red-500 origin-bottom transform -translate-x-1/2 -translate-y-full rotate-90 animate-spin" style={{ animationDuration: '60s' }}></div>
                                </div>

                                {/* 周囲の時間インジケーター */}
                                {[0, 45, 90, 135, 180, 225, 270, 315].map((rotation, index) => (
                                    <div
                                        key={rotation}
                                        className="absolute w-2 h-2 bg-orange-400 rounded-full animate-bounce-gentle"
                                        style={{
                                            top: '50%',
                                            left: '50%',
                                            transform: `translate(-50%, -50%) rotate(${rotation}deg) translateY(-20px)`,
                                            animationDelay: `${index * 0.2}s`
                                        }}
                                    ></div>
                                ))}
                            </div>
                        </div>
                    ),
                    actionIcon: Calendar,
                    gradientFrom: 'from-orange-500',
                    gradientTo: 'to-red-500'
                };

            case 'habits':
                return {
                    icon: Star,
                    title: '🌟 良い習慣を築こう',
                    description: '継続は力なり。今日から新しい習慣を始めませんか？',
                    illustration: (
                        <div className="relative">
                            <div className="w-32 h-32 mx-auto mb-4 relative">
                                {/* 星座イラスト */}
                                <div className="absolute inset-0">
                                    <Star className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-8 text-yellow-400 animate-bounce-gentle" />
                                    <Star className="absolute top-1/3 left-0 w-6 h-6 text-yellow-300 animate-bounce-gentle" style={{ animationDelay: '0.3s' }} />
                                    <Star className="absolute top-1/3 right-0 w-6 h-6 text-yellow-300 animate-bounce-gentle" style={{ animationDelay: '0.6s' }} />
                                    <Star className="absolute bottom-1/3 left-1/4 w-5 h-5 text-yellow-200 animate-bounce-gentle" style={{ animationDelay: '0.9s' }} />
                                    <Star className="absolute bottom-1/3 right-1/4 w-5 h-5 text-yellow-200 animate-bounce-gentle" style={{ animationDelay: '1.2s' }} />
                                    <Star className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-7 h-7 text-yellow-400 animate-bounce-gentle" style={{ animationDelay: '1.5s' }} />
                                </div>

                                {/* 接続線 */}
                                <svg className="absolute inset-0 w-full h-full">
                                    <path
                                        d="M 64 16 L 16 42 L 48 42 L 32 74 L 48 74 L 64 106 L 80 74 L 96 74 L 80 42 L 112 42 Z"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeDasharray="5,5"
                                        className="text-yellow-300 animate-pulse"
                                    />
                                </svg>
                            </div>
                        </div>
                    ),
                    actionIcon: Star,
                    gradientFrom: 'from-yellow-500',
                    gradientTo: 'to-orange-500'
                };
        }
    };

    const config = getEmptyStateConfig();

    return (
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-64">
            {/* イラスト */}
            <div className="mb-6">
                {config.illustration}
            </div>

            {/* メインメッセージ */}
            <div className="max-w-md mx-auto mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-3 animate-fade-in">
                    {config.title}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    {config.description}
                </p>
            </div>

            {/* アクションボタン */}
            {onAction && (
                <button
                    onClick={onAction}
                    className={`group relative overflow-hidden bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-scale-in`}
                    style={{ animationDelay: '0.4s' }}
                >
                    {/* ボタンの背景エフェクト */}
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

                    {/* ボタンコンテンツ */}
                    <div className="relative flex items-center space-x-3">
                        <config.actionIcon className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                        <span>{actionLabel || 'はじめる'}</span>
                    </div>

                    {/* ホバー時のパーティクルエフェクト */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-1 h-1 bg-white rounded-full animate-bounce-gentle"
                                style={{
                                    left: `${20 + i * 10}%`,
                                    top: `${30 + (i % 2) * 40}%`,
                                    animationDelay: `${i * 0.1}s`,
                                    animationDuration: '1s'
                                }}
                            ></div>
                        ))}
                    </div>
                </button>
            )}

            {/* サブメッセージ */}
            <div className="mt-4 text-sm text-gray-500 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <p className="flex items-center justify-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span>効率的なタスク管理で、もっと充実した毎日を</span>
                </p>
            </div>
        </div>
    );
}

export default EmptyState; 