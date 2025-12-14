import React, { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { isPast } from 'date-fns';
import './DraggableTaskList.css';

// MUI Icons
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import FitnessCenterOutlinedIcon from '@mui/icons-material/FitnessCenterOutlined';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ArchiveIcon from '@mui/icons-material/Archive';
import TimerIcon from '@mui/icons-material/Timer';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CommentIcon from '@mui/icons-material/Comment';

// Sortable Task Item
const SortableTaskItem = ({ task, onToggle, onDelete, onEdit, onArchive }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const getCategoryIcon = (category) => {
    const icons = {
      work: <WorkOutlineIcon fontSize="small" />,
      study: <SchoolOutlinedIcon fontSize="small" />,
      home: <HomeOutlinedIcon fontSize="small" />,
      personal: <PersonOutlinedIcon fontSize="small" />,
      health: <FitnessCenterOutlinedIcon fontSize="small" />
    };
    return icons[category] || <WorkOutlineIcon fontSize="small" />;
  };

  const getPriorityColor = (priority) => {
    const colors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
    return colors[priority] || '#94a3b8';
  };

  const isOverdue = isPast(new Date(`${task.date}T${task.time}`)) && !task.completed;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`draggable-task ${task.completed ? 'completed' : ''} ${isDragging ? 'dragging' : ''} ${isOverdue ? 'overdue' : ''}`}
    >
      <div className="drag-handle" {...attributes} {...listeners}>
        <DragIndicatorIcon />
      </div>

      <button 
        className="task-checkbox"
        onClick={() => onToggle(task.id)}
      >
        {task.completed 
          ? <CheckCircleOutlineIcon className="checked" />
          : <RadioButtonUncheckedIcon />
        }
      </button>

      <div className="task-content">
        <div className="task-header">
          <span className={`task-title ${task.completed ? 'strikethrough' : ''}`}>
            {task.title}
          </span>
          <span 
            className="task-priority"
            style={{ background: `${getPriorityColor(task.priority)}20`, color: getPriorityColor(task.priority) }}
          >
            {task.priority === 'high' ? 'Yuqori' : task.priority === 'medium' ? "O'rta" : 'Past'}
          </span>
        </div>

        <div className="task-meta">
          <span className="meta-item">
            {getCategoryIcon(task.category)}
          </span>
          <span className="meta-item">
            <AccessTimeIcon fontSize="inherit" />
            {task.time}
          </span>
          {task.tags && task.tags.length > 0 && (
            <span className="meta-item tags">
              <LocalOfferIcon fontSize="inherit" />
              {task.tags.length}
            </span>
          )}
          {task.comments && task.comments.length > 0 && (
            <span className="meta-item">
              <CommentIcon fontSize="inherit" />
              {task.comments.length}
            </span>
          )}
          {task.attachments && task.attachments.length > 0 && (
            <span className="meta-item">
              <AttachFileIcon fontSize="inherit" />
              {task.attachments.length}
            </span>
          )}
          {task.timeSpent > 0 && (
            <span className="meta-item time-spent">
              <TimerIcon fontSize="inherit" />
              {Math.floor(task.timeSpent / 60)}m
            </span>
          )}
        </div>
      </div>

      <div className="task-actions">
        <button className="action-btn edit" onClick={() => onEdit(task)} title="Tahrirlash">
          <EditOutlinedIcon fontSize="small" />
        </button>
        <button className="action-btn archive" onClick={() => onArchive(task.id)} title="Arxivlash">
          <ArchiveIcon fontSize="small" />
        </button>
        <button className="action-btn delete" onClick={() => onDelete(task.id)} title="O'chirish">
          <DeleteOutlineIcon fontSize="small" />
        </button>
      </div>
    </div>
  );
};

// Task Preview for Drag Overlay
const TaskPreview = ({ task }) => {
  return (
    <div className="task-preview">
      <DragIndicatorIcon />
      <span>{task.title}</span>
    </div>
  );
};

const DraggableTaskList = ({ 
  tasks = [], 
  onReorder, 
  onToggle, 
  onDelete, 
  onEdit,
  onArchive 
}) => {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeTask = useMemo(() => {
    return tasks.find(t => t.id === activeId);
  }, [activeId, tasks]);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (active.id !== over?.id) {
      const oldIndex = tasks.findIndex(t => t.id === active.id);
      const newIndex = tasks.findIndex(t => t.id === over.id);
      const newOrder = arrayMove(tasks, oldIndex, newIndex);
      onReorder(newOrder);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  if (tasks.length === 0) {
    return (
      <div className="empty-draggable-list">
        <DragIndicatorIcon style={{ fontSize: 48, opacity: 0.3 }} />
        <p>Vazifalar yo'q</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="draggable-task-list">
          {tasks.map(task => (
            <SortableTaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
              onArchive={onArchive}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeTask && <TaskPreview task={activeTask} />}
      </DragOverlay>
    </DndContext>
  );
};

export default DraggableTaskList;
