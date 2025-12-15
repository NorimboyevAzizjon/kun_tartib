import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskList from './TaskList';

describe('TaskList', () => {
  const tasks = [
    { id: '1', title: 'Test task', date: '2025-12-14', time: '12:00', category: 'work', priority: 'medium', completed: false },
    { id: '2', title: 'Another task', date: '2025-12-14', time: '13:00', category: 'study', priority: 'high', completed: true }
  ];

  it('renders task titles', () => {
    render(<TaskList tasks={tasks} />);
    expect(screen.getByText('Test task')).toBeInTheDocument();
    expect(screen.getByText('Another task')).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = jest.fn();
    render(<TaskList tasks={tasks} onDelete={onDelete} />);
    const deleteBtns = screen.getAllByLabelText(/O'chirish/i);
    fireEvent.click(deleteBtns[0]);
    expect(onDelete).toHaveBeenCalled();
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = jest.fn();
    render(<TaskList tasks={tasks} onEdit={onEdit} />);
    const editBtns = screen.getAllByLabelText(/Tahrirlash/i);
    fireEvent.click(editBtns[0]);
    expect(onEdit).toHaveBeenCalled();
  });
});
