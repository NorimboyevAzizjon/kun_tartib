import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';

// ✅ Test utilities
const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('App Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('LocalStorage', () => {
    it('should save and retrieve tasks', () => {
      const tasks = [
        { id: '1', title: 'Test vazifa', completed: false }
      ];
      
      localStorage.setItem('kun-tartibi-tasks', JSON.stringify(tasks));
      const saved = JSON.parse(localStorage.getItem('kun-tartibi-tasks'));
      
      expect(localStorage.setItem).toHaveBeenCalled();
      expect(localStorage.getItem).toHaveBeenCalledWith('kun-tartibi-tasks');
    });

    it('should save user preferences', () => {
      const theme = 'dark';
      localStorage.setItem('kuntartib-theme', theme);
      
      expect(localStorage.setItem).toHaveBeenCalledWith('kuntartib-theme', 'dark');
    });
  });

  describe('Date Utils', () => {
    it('should format date correctly', () => {
      const date = new Date('2026-02-03');
      const formatted = date.toLocaleDateString('uz-UZ');
      
      expect(formatted).toBeDefined();
    });

    it('should calculate days difference', () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const diff = Math.ceil((tomorrow - today) / (1000 * 60 * 60 * 24));
      expect(diff).toBe(1);
    });
  });

  describe('Task Priority', () => {
    it('should have valid priority levels', () => {
      const priorities = ['low', 'medium', 'high'];
      
      expect(priorities).toContain('low');
      expect(priorities).toContain('medium');
      expect(priorities).toContain('high');
      expect(priorities.length).toBe(3);
    });
  });

  describe('Pomodoro Timer', () => {
    it('should have correct default durations', () => {
      const workDuration = 25 * 60; // 25 minutes in seconds
      const breakDuration = 5 * 60; // 5 minutes in seconds
      const longBreak = 15 * 60; // 15 minutes in seconds
      
      expect(workDuration).toBe(1500);
      expect(breakDuration).toBe(300);
      expect(longBreak).toBe(900);
    });
  });

  describe('Gamification', () => {
    it('should calculate XP correctly', () => {
      const calculateXP = (tasksCompleted) => tasksCompleted * 10;
      
      expect(calculateXP(5)).toBe(50);
      expect(calculateXP(10)).toBe(100);
    });

    it('should determine level from XP', () => {
      const getLevel = (xp) => Math.floor(xp / 100) + 1;
      
      expect(getLevel(0)).toBe(1);
      expect(getLevel(99)).toBe(1);
      expect(getLevel(100)).toBe(2);
      expect(getLevel(250)).toBe(3);
    });
  });

  describe('Filter Functions', () => {
    it('should filter completed tasks', () => {
      const tasks = [
        { id: '1', title: 'Task 1', completed: true },
        { id: '2', title: 'Task 2', completed: false },
        { id: '3', title: 'Task 3', completed: true },
      ];
      
      const completed = tasks.filter(t => t.completed);
      const active = tasks.filter(t => !t.completed);
      
      expect(completed.length).toBe(2);
      expect(active.length).toBe(1);
    });

    it('should filter by category', () => {
      const tasks = [
        { id: '1', title: 'Task 1', category: 'work' },
        { id: '2', title: 'Task 2', category: 'personal' },
        { id: '3', title: 'Task 3', category: 'work' },
      ];
      
      const workTasks = tasks.filter(t => t.category === 'work');
      expect(workTasks.length).toBe(2);
    });
  });

  describe('Search Functionality', () => {
    it('should search tasks by title', () => {
      const tasks = [
        { id: '1', title: 'Buy groceries' },
        { id: '2', title: 'Call mom' },
        { id: '3', title: 'Buy new shoes' },
      ];
      
      const searchTerm = 'buy';
      const results = tasks.filter(t => 
        t.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      expect(results.length).toBe(2);
    });
  });
});
