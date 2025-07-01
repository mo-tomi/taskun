import { useState, useCallback, useRef } from 'react';

interface UndoRedoState<T> {
    past: T[];
    present: T;
    future: T[];
}

interface UndoRedoActions {
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    clearHistory: () => void;
    addToHistory: (newState: any) => void;
}

export function useUndoRedo<T>(initialState: T, maxHistorySize: number = 50): [T, UndoRedoActions] {
    const [state, setState] = useState<UndoRedoState<T>>({
        past: [],
        present: initialState,
        future: []
    });

    const addToHistory = useCallback((newState: T) => {
        setState(currentState => {
            // 同じ状態の場合は履歴に追加しない
            if (JSON.stringify(currentState.present) === JSON.stringify(newState)) {
                return currentState;
            }

            const newPast = [...currentState.past, currentState.present];

            // 履歴サイズ制限
            if (newPast.length > maxHistorySize) {
                newPast.shift();
            }

            return {
                past: newPast,
                present: newState,
                future: [] // 新しい変更があったらfutureをクリア
            };
        });
    }, [maxHistorySize]);

    const undo = useCallback(() => {
        setState(currentState => {
            if (currentState.past.length === 0) return currentState;

            const previous = currentState.past[currentState.past.length - 1];
            const newPast = currentState.past.slice(0, currentState.past.length - 1);

            return {
                past: newPast,
                present: previous,
                future: [currentState.present, ...currentState.future]
            };
        });
    }, []);

    const redo = useCallback(() => {
        setState(currentState => {
            if (currentState.future.length === 0) return currentState;

            const next = currentState.future[0];
            const newFuture = currentState.future.slice(1);

            return {
                past: [...currentState.past, currentState.present],
                present: next,
                future: newFuture
            };
        });
    }, []);

    const clearHistory = useCallback(() => {
        setState(currentState => ({
            past: [],
            present: currentState.present,
            future: []
        }));
    }, []);

    const actions: UndoRedoActions = {
        undo,
        redo,
        canUndo: state.past.length > 0,
        canRedo: state.future.length > 0,
        clearHistory,
        addToHistory
    };

    return [state.present, actions];
} 