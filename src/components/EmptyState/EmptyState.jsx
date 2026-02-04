import React from 'react';
import './EmptyState.css';

// MUI Icons
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import NotificationsOffOutlinedIcon from '@mui/icons-material/NotificationsOffOutlined';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';

// Preset configurations for different empty states
const presets = {
  tasks: {
    icon: <AssignmentOutlinedIcon />,
    title: "Hech qanday vazifa yo'q",
    description: "Yangi vazifa qo'shib, kunni rejalashtiring!",
    emoji: '📋',
    actionText: "Vazifa qo'shish"
  },
  completed: {
    icon: <CheckCircleOutlineIcon />,
    title: "Bajarilgan vazifalar yo'q",
    description: "Vazifalarni bajaring va bu yerda ko'ring!",
    emoji: '✅',
  },
  search: {
    icon: <SearchOffIcon />,
    title: "Natija topilmadi",
    description: "Qidiruv so'rovingizga mos natija yo'q",
    emoji: '🔍',
  },
  calendar: {
    icon: <EventBusyIcon />,
    title: "Bu kunga vazifa yo'q",
    description: "Tanlangan sana uchun rejalashtirilgan vazifalar yo'q",
    emoji: '📅',
  },
  notes: {
    icon: <NoteAddIcon />,
    title: "Eslatmalar bo'sh",
    description: "Fikrlaringizni yozib qo'ying!",
    emoji: '📝',
    actionText: "Eslatma qo'shish"
  },
  goals: {
    icon: <FlagOutlinedIcon />,
    title: "Maqsadlar yo'q",
    description: "Maqsadlaringizni belgilang va ularga erishing!",
    emoji: '🎯',
    actionText: "Maqsad qo'shish"
  },
  archive: {
    icon: <ArchiveOutlinedIcon />,
    title: "Arxiv bo'sh",
    description: "Arxivlangan vazifalar bu yerda ko'rinadi",
    emoji: '📦',
  },
  tags: {
    icon: <LocalOfferOutlinedIcon />,
    title: "Teglar yo'q",
    description: "Vazifalarni teglar bilan tartibga soling!",
    emoji: '🏷️',
    actionText: "Teg qo'shish"
  },
  notifications: {
    icon: <NotificationsOffOutlinedIcon />,
    title: "Bildirishnomalar yo'q",
    description: "Yangi bildirishnomalar bu yerda ko'rinadi",
    emoji: '🔔',
  },
  allDone: {
    icon: <SentimentSatisfiedAltIcon />,
    title: "Hammasi bajarildi! 🎉",
    description: "Barcha vazifalar tugatildi. Dam oling yoki yangi vazifa qo'shing!",
    emoji: '🎊',
    celebration: true
  }
};

const EmptyState = ({
  type = 'tasks',
  title,
  description,
  icon,
  emoji,
  actionText,
  onAction,
  children,
  compact = false,
  animated = true
}) => {
  // Get preset or use custom props
  const preset = presets[type] || presets.tasks;
  const displayIcon = icon || preset.icon;
  const displayTitle = title || preset.title;
  const displayDescription = description || preset.description;
  const displayEmoji = emoji || preset.emoji;
  const displayActionText = actionText || preset.actionText;
  const isCelebration = preset.celebration;

  return (
    <div className={`empty-state ${compact ? 'compact' : ''} ${animated ? 'animated' : ''} ${isCelebration ? 'celebration' : ''}`}>
      {/* Floating background elements */}
      {animated && !compact && (
        <div className="empty-state-bg">
          <span className="bg-shape shape-1"></span>
          <span className="bg-shape shape-2"></span>
          <span className="bg-shape shape-3"></span>
        </div>
      )}

      {/* Emoji */}
      <div className="empty-state-emoji">{displayEmoji}</div>

      {/* Icon */}
      <div className="empty-state-icon">
        {displayIcon}
      </div>

      {/* Content */}
      <h3 className="empty-state-title">{displayTitle}</h3>
      <p className="empty-state-description">{displayDescription}</p>

      {/* Action Button */}
      {displayActionText && onAction && (
        <button className="empty-state-action" onClick={onAction}>
          {displayActionText}
        </button>
      )}

      {/* Custom children */}
      {children && (
        <div className="empty-state-custom">
          {children}
        </div>
      )}

      {/* Celebration confetti for allDone type */}
      {isCelebration && (
        <div className="celebration-particles">
          {Array.from({ length: 20 }).map((_, i) => (
            <span 
              key={i} 
              className="particle"
              style={{
                '--delay': `${Math.random() * 2}s`,
                '--x': `${Math.random() * 100}%`,
                '--color': ['#667eea', '#764ba2', '#4CAF50', '#FF9800'][Math.floor(Math.random() * 4)]
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
