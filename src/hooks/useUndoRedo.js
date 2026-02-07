import { useState, useCallback, useEffect } from 'react';

// Undo/Redo Hook - state-based implementation
export const useUndoRedo = (initialState, maxHistory = 50) => {
  const [state, setState] = useState(initialState);
  const [history, setHistory] = useState([initialState]);
  const [position, setPosition] = useState(0);
  const [isUndoRedo, setIsUndoRedo] = useState(false);

  // Yangi state qo'shish
  const pushState = useCallback((newState) => {
    if (isUndoRedo) {
      setIsUndoRedo(false);
      return;
    }

    setHistory(prevHistory => {
      let newHistory = prevHistory;
      
      // Agar o'rtada bo'lsak, keyingilarni o'chirish
      if (position < prevHistory.length - 1) {
        newHistory = prevHistory.slice(0, position + 1);
      }

      // Yangi state qo'shish
      newHistory = [...newHistory, newState];

      // Max history cheklash
      if (newHistory.length > maxHistory) {
        newHistory = newHistory.slice(1);
      }
      
      return newHistory;
    });
    
    setPosition(prev => Math.min(prev + 1, maxHistory - 1));
    setState(newState);
  }, [isUndoRedo, maxHistory, position]);

  // Undo
  const undo = useCallback(() => {
    if (position > 0) {
      const newPos = position - 1;
      setPosition(newPos);
      setIsUndoRedo(true);
      const prevState = history[newPos];
      setState(prevState);
      return prevState;
    }
    return null;
  }, [position, history]);

  // Redo
  const redo = useCallback(() => {
    if (position < history.length - 1) {
      const newPos = position + 1;
      setPosition(newPos);
      setIsUndoRedo(true);
      const nextState = history[newPos];
      setState(nextState);
      return nextState;
    }
    return null;
  }, [position, history]);

  // Tarixni tozalash
  const clearHistory = useCallback(() => {
    setHistory([state]);
    setPosition(0);
  }, [state]);

  return {
    state,
    setState: pushState,
    undo,
    redo,
    canUndo: position > 0,
    canRedo: position < history.length - 1,
    clearHistory,
    getHistoryLength: useCallback(() => history.length, [history.length]),
    getCurrentPosition: useCallback(() => position, [position])
  };
};

// Task uchun maxsus Undo/Redo
export const useTaskUndoRedo = () => {
  const [actions, setActions] = useState([]);
  const [position, setPosition] = useState(-1);
  const maxActions = 30;

  // Action qo'shish
  const addAction = useCallback((action) => {
    setActions(prevActions => {
      let newActions = prevActions;
      
      // Agar o'rtada bo'lsak, keyingilarni o'chirish
      if (position < prevActions.length - 1) {
        newActions = prevActions.slice(0, position + 1);
      }

      newActions = [...newActions, action];

      // Max limit
      if (newActions.length > maxActions) {
        newActions = newActions.slice(1);
      }
      
      return newActions;
    });
    
    setPosition(prev => Math.min(prev + 1, maxActions - 1));
  }, [position]);

  // Undo - oxirgi amalni bekor qilish
  const undo = useCallback(() => {
    if (position >= 0) {
      const action = actions[position];
      setPosition(prev => prev - 1);
      return action;
    }
    return null;
  }, [position, actions]);

  // Redo - bekor qilingan amalni qaytarish
  const redo = useCallback(() => {
    if (position < actions.length - 1) {
      const newPos = position + 1;
      setPosition(newPos);
      return actions[newPos];
    }
    return null;
  }, [position, actions]);

  const canUndo = position >= 0;
  const canRedo = position < actions.length - 1;

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
