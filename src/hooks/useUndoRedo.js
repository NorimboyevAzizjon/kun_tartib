import { useState, useCallback, useRef, useEffect } from 'react';

// Undo/Redo Hook
export const useUndoRedo = (initialState, maxHistory = 50) => {
  const [state, setState] = useState(initialState);
  const historyRef = useRef([initialState]);
  const positionRef = useRef(0);
  const isUndoRedoRef = useRef(false);

  // Yangi state qo'shish
  const pushState = useCallback((newState) => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }

    const history = historyRef.current;
    const position = positionRef.current;

    // Agar o'rtada bo'lsak, keyingilarni o'chirish
    if (position < history.length - 1) {
      historyRef.current = history.slice(0, position + 1);
    }

    // Yangi state qo'shish
    historyRef.current.push(newState);

    // Max history cheklash
    if (historyRef.current.length > maxHistory) {
      historyRef.current.shift();
    } else {
      positionRef.current++;
    }

    setState(newState);
  }, [maxHistory]);

  // Undo
  const undo = useCallback(() => {
    if (positionRef.current > 0) {
      positionRef.current--;
      isUndoRedoRef.current = true;
      const prevState = historyRef.current[positionRef.current];
      setState(prevState);
      return prevState;
    }
    return null;
  }, []);

  // Redo
  const redo = useCallback(() => {
    if (positionRef.current < historyRef.current.length - 1) {
      positionRef.current++;
      isUndoRedoRef.current = true;
      const nextState = historyRef.current[positionRef.current];
      setState(nextState);
      return nextState;
    }
    return null;
  }, []);

  // Undo/Redo imkoniyatini tekshirish
  const getCanUndo = useCallback(() => positionRef.current > 0, []);
  const getCanRedo = useCallback(() => positionRef.current < historyRef.current.length - 1, []);

  // Tarixni tozalash
  const clearHistory = useCallback(() => {
    historyRef.current = [state];
    positionRef.current = 0;
  }, [state]);

  return {
    state,
    setState: pushState,
    undo,
    redo,
    canUndo: getCanUndo(),
    canRedo: getCanRedo(),
    clearHistory,
    getHistoryLength: useCallback(() => historyRef.current.length, []),
    getCurrentPosition: useCallback(() => positionRef.current, [])
  };
};

// Task uchun maxsus Undo/Redo
export const useTaskUndoRedo = () => {
  const actionsRef = useRef([]);
  const positionRef = useRef(-1);
  const maxActions = 30;

  // Action qo'shish
  const addAction = useCallback((action) => {
    const actions = actionsRef.current;
    
    // Agar o'rtada bo'lsak, keyingilarni o'chirish
    if (positionRef.current < actions.length - 1) {
      actionsRef.current = actions.slice(0, positionRef.current + 1);
    }

    actionsRef.current.push(action);

    // Max limit
    if (actionsRef.current.length > maxActions) {
      actionsRef.current.shift();
    } else {
      positionRef.current++;
    }
  }, []);

  // Undo - oxirgi amalni bekor qilish
  const undo = useCallback(() => {
    if (positionRef.current >= 0) {
      const action = actionsRef.current[positionRef.current];
      positionRef.current--;
      return action;
    }
    return null;
  }, []);

  // Redo - bekor qilingan amalni qaytarish
  const redo = useCallback(() => {
    if (positionRef.current < actionsRef.current.length - 1) {
      positionRef.current++;
      return actionsRef.current[positionRef.current];
    }
    return null;
  }, []);

  const canUndo = positionRef.current >= 0;
  const canRedo = positionRef.current < actionsRef.current.length - 1;

  return { addAction, undo, redo, canUndo, canRedo };
};

// Keyboard shortcut bilan Undo/Redo
export const useUndoRedoKeyboard = (onUndo, onRedo) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Z - Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        onUndo?.();
      }
      // Ctrl+Shift+Z yoki Ctrl+Y - Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        onRedo?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onUndo, onRedo]);
};

export default useUndoRedo;
