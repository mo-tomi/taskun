import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, Star, Zap, Calendar, Heart, Target } from 'lucide-react';

interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    target?: string; // CSS セレクター
    position?: 'top' | 'bottom' | 'left' | 'right';
    action?: () => void;
}

interface OnboardingTourProps {
    isVisible: boolean;
    onComplete: () => void;
    onSkip: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({
    isVisible,
    onComplete,
    onSkip
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const steps: OnboardingStep[] = [
        {
            id: 'welcome',
            title: 'Taskunへようこそ！',
            description: 'あなたの時間を最大化する、スマートなタスク管理ツールです。一緒に基本的な使い方を見ていきましょう。',
            icon: <Star className="w-8 h-8 text-yellow-500" />
        },
        {
            id: 'timeline',
            title: 'タイムライン表示',
            description: '1日のスケジュールが一目で分かります。タスクをドラッグ&ドロップで簡単に時間調整できます。',
            icon: <Calendar className="w-8 h-8 text-blue-500" />,
            target: '.timeline-container'
        },
        {
            id: 'quick-add',
            title: 'クイック追加',
            description: 'Ctrl+Nで素早くタスクを追加できます。思いついたタスクをすぐに記録しましょう。',
            icon: <Zap className="w-8 h-8 text-green-500" />,
            target: '.quick-add-button'
        },
        {
            id: 'energy-tracking',
            title: 'エネルギー管理',
            description: '1日のエネルギーレベルを記録して、最適な作業時間を見つけましょう。',
            icon: <Heart className="w-8 h-8 text-red-500" />,
            target: '.energy-tracker'
        },
        {
            id: 'personalization',
            title: 'カスタマイズ',
            description: 'テーマやレイアウトをカスタマイズして、あなた好みの作業環境を作りましょう。',
            icon: <Target className="w-8 h-8 text-purple-500" />
        }
    ];

    const handleNext = async () => {
        if (currentStep < steps.length - 1) {
            setIsAnimating(true);
            await new Promise(resolve => setTimeout(resolve, 150));
            setCurrentStep(prev => prev + 1);
            setIsAnimating(false);
        } else {
            onComplete();
        }
    };

    const handlePrev = async () => {
        if (currentStep > 0) {
            setIsAnimating(true);
            await new Promise(resolve => setTimeout(resolve, 150));
            setCurrentStep(prev => prev - 1);
            setIsAnimating(false);
        }
    };

    const handleSkip = () => {
        onSkip();
    };

    const currentStepData = steps[currentStep];

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 relative"
                >
                    {/* ヘッダー */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            {currentStepData.icon}
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {currentStepData.title}
                            </h2>
                        </div>
                        <button
                            onClick={handleSkip}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* プログレスバー */}
                    <div className="mb-6">
                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                            <span>ステップ {currentStep + 1} / {steps.length}</span>
                            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <motion.div
                                className="bg-blue-500 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>

                    {/* コンテンツ */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: isAnimating ? 20 : 0 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="mb-8"
                        >
                            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                                {currentStepData.description}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    {/* ナビゲーションボタン */}
                    <div className="flex justify-between items-center">
                        <button
                            onClick={handlePrev}
                            disabled={currentStep === 0}
                            className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:text-gray-800 dark:hover:text-white transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span>前へ</span>
                        </button>

                        <div className="flex space-x-2">
                            {steps.map((_, index) => (
                                <div
                                    key={index}
                                    className={`w-2 h-2 rounded-full transition-colors ${index === currentStep
                                        ? 'bg-blue-500'
                                        : index < currentStep
                                            ? 'bg-blue-300'
                                            : 'bg-gray-300 dark:bg-gray-600'
                                        }`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={handleNext}
                            className="flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            <span>{currentStep === steps.length - 1 ? '完了' : '次へ'}</span>
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* スキップボタン */}
                    <div className="mt-4 text-center">
                        <button
                            onClick={handleSkip}
                            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        >
                            ツアーをスキップ
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default OnboardingTour; 