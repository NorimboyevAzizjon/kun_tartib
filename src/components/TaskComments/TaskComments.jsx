import { useState } from 'react';
import CommentIcon from '@mui/icons-material/Comment';
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ReplyIcon from '@mui/icons-material/Reply';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { uz } from 'date-fns/locale';
import './TaskComments.css';

const TaskComments = ({ 
  comments = [], 
  onAddComment, 
  onEditComment, 
  onDeleteComment,
  onReplyComment,
  currentUser = { name: 'Foydalanuvchi', avatar: null }
}) => {
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState({});
  const [showMenu, setShowMenu] = useState(null);

  // Sharh qo'shish
  const handleAddComment = () => {
    if (newComment.trim()) {
      const generateId = () => Date.now().toString();
      const comment = {
        id: generateId(),
        text: newComment.trim(),
        author: currentUser.name,
        avatar: currentUser.avatar,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        replies: []
      };
      onAddComment && onAddComment(comment);
      setNewComment('');
    }
  };

  // Sharhni tahrirlash
  const handleEditComment = (commentId) => {
    if (editText.trim()) {
      onEditComment && onEditComment(commentId, {
        text: editText.trim(),
        updatedAt: new Date().toISOString()
      });
      setEditingComment(null);
      setEditText('');
    }
  };

  // Javob yozish
  const handleReply = (commentId) => {
    if (replyText.trim()) {
      const generateReplyId = () => Date.now().toString();
      const reply = {
        id: generateReplyId(),
        text: replyText.trim(),
        author: currentUser.name,
        avatar: currentUser.avatar,
        createdAt: new Date().toISOString(),
        parentId: commentId
      };
      onReplyComment && onReplyComment(commentId, reply);
      setReplyingTo(null);
      setReplyText('');
    }
  };

  // Tahrirlash rejimini boshlash
  const startEditing = (comment) => {
    setEditingComment(comment.id);
    setEditText(comment.text);
    setShowMenu(null);
  };

  // Javoblarni ko'rsatish/yashirish
  const toggleReplies = (commentId) => {
    setExpandedReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  // Sanani formatlash
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
      if (!isValid(date)) return '';
      
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return formatDistanceToNow(date, { addSuffix: true, locale: uz });
      }
      return format(date, 'd MMMM yyyy, HH:mm', { locale: uz });
    } catch {
      return '';
    }
  };

  // Avatar rangi
  const getAvatarColor = (name) => {
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#22c55e', 
      '#14b8a6', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'
    ];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  return (
    <div className="task-comments">
      <div className="comments-header">
        <CommentIcon />
        <h3>Sharhlar</h3>
        <span className="comments-count">{comments.length}</span>
      </div>

      {/* Yangi sharh qo'shish */}
      <div className="add-comment">
        <div 
          className="comment-avatar"
          style={{ backgroundColor: getAvatarColor(currentUser.name) }}
        >
          {currentUser.avatar ? (
            <img src={currentUser.avatar} alt={currentUser.name} />
          ) : (
            <span>{currentUser.name?.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="comment-input-wrapper">
          <textarea
            placeholder="Sharh yozing..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddComment();
              }
            }}
            rows={1}
          />
          <button 
            className="send-btn"
            onClick={handleAddComment}
            disabled={!newComment.trim()}
          >
            <SendIcon />
          </button>
        </div>
      </div>

      {/* Sharhlar ro'yxati */}
      {comments.length === 0 ? (
        <div className="no-comments">
          <CommentIcon className="empty-icon" />
          <p>Hali sharhlar yo'q</p>
          <span>Birinchi bo'lib sharh qoldiring!</span>
        </div>
      ) : (
        <div className="comments-list">
          {comments.map(comment => (
            <div key={comment.id} className="comment-item">
              <div 
                className="comment-avatar"
                style={{ backgroundColor: getAvatarColor(comment.author) }}
              >
                {comment.avatar ? (
                  <img src={comment.avatar} alt={comment.author} />
                ) : (
                  <span>{comment.author?.charAt(0).toUpperCase()}</span>
                )}
              </div>

              <div className="comment-content">
                <div className="comment-header">
                  <div className="comment-info">
                    <span className="comment-author">{comment.author}</span>
                    <span className="comment-time">
                      <AccessTimeIcon />
                      {formatDate(comment.createdAt)}
                      {comment.updatedAt && ' (tahrirlangan)'}
                    </span>
                  </div>

                  <div className="comment-menu">
                    <button 
                      className="menu-trigger"
                      onClick={() => setShowMenu(showMenu === comment.id ? null : comment.id)}
                    >
                      <MoreVertIcon />
                    </button>
                    
                    {showMenu === comment.id && (
                      <div className="menu-dropdown">
                        <button onClick={() => startEditing(comment)}>
                          <EditIcon />
                          Tahrirlash
                        </button>
                        <button 
                          className="delete-option"
                          onClick={() => {
                            onDeleteComment && onDeleteComment(comment.id);
                            setShowMenu(null);
                          }}
                        >
                          <DeleteIcon />
                          O'chirish
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {editingComment === comment.id ? (
                  <div className="edit-comment">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      autoFocus
                    />
                    <div className="edit-actions">
                      <button 
                        className="cancel-btn"
                        onClick={() => {
                          setEditingComment(null);
                          setEditText('');
                        }}
                      >
                        Bekor qilish
                      </button>
                      <button 
                        className="save-btn"
                        onClick={() => handleEditComment(comment.id)}
                        disabled={!editText.trim()}
                      >
                        Saqlash
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="comment-text">{comment.text}</p>
                )}

                {/* Javob tugmasi */}
                <div className="comment-actions">
                  <button 
                    className="reply-btn"
                    onClick={() => {
                      setReplyingTo(replyingTo === comment.id ? null : comment.id);
                      setReplyText('');
                    }}
                  >
                    <ReplyIcon />
                    Javob berish
                  </button>

                  {comment.replies && comment.replies.length > 0 && (
                    <button 
                      className="toggle-replies-btn"
                      onClick={() => toggleReplies(comment.id)}
                    >
                      {expandedReplies[comment.id] ? (
                        <>
                          <ExpandLessIcon />
                          Javoblarni yashirish
                        </>
                      ) : (
                        <>
                          <ExpandMoreIcon />
                          {comment.replies.length} ta javob
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Javob yozish */}
                {replyingTo === comment.id && (
                  <div className="reply-form">
                    <div 
                      className="comment-avatar small"
                      style={{ backgroundColor: getAvatarColor(currentUser.name) }}
                    >
                      <span>{currentUser.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="reply-input-wrapper">
                      <textarea
                        placeholder="Javob yozing..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        autoFocus
                      />
                      <div className="reply-actions">
                        <button 
                          className="cancel-btn"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText('');
                          }}
                        >
                          Bekor qilish
                        </button>
                        <button 
                          className="send-reply-btn"
                          onClick={() => handleReply(comment.id)}
                          disabled={!replyText.trim()}
                        >
                          <SendIcon />
                          Yuborish
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Javoblar */}
                {comment.replies && comment.replies.length > 0 && expandedReplies[comment.id] && (
                  <div className="replies-list">
                    {comment.replies.map(reply => (
                      <div key={reply.id} className="reply-item">
                        <div 
                          className="comment-avatar small"
                          style={{ backgroundColor: getAvatarColor(reply.author) }}
                        >
                          <span>{reply.author?.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="reply-content">
                          <div className="reply-header">
                            <span className="reply-author">{reply.author}</span>
                            <span className="reply-time">{formatDate(reply.createdAt)}</span>
                          </div>
                          <p className="reply-text">{reply.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskComments;
