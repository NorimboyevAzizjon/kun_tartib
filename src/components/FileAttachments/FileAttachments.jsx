import { useState, useRef } from 'react';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import ErrorIcon from '@mui/icons-material/Error';
import { format, parseISO, isValid } from 'date-fns';
import { uz } from 'date-fns/locale';
import './FileAttachments.css';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'application/zip', 'application/x-rar-compressed',
  'video/mp4', 'audio/mpeg', 'audio/wav'
];

const FileAttachments = ({ 
  attachments = [], 
  onAddAttachment, 
  onRemoveAttachment,
  maxFiles = 5 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Fayl turini aniqlash
  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return <ImageIcon className="file-icon image" />;
    if (type === 'application/pdf') return <PictureAsPdfIcon className="file-icon pdf" />;
    if (type?.includes('word') || type?.includes('document')) return <DescriptionIcon className="file-icon doc" />;
    if (type?.includes('excel') || type?.includes('sheet')) return <DescriptionIcon className="file-icon excel" />;
    if (type?.startsWith('video/')) return <VideoFileIcon className="file-icon video" />;
    if (type?.startsWith('audio/')) return <AudioFileIcon className="file-icon audio" />;
    if (type?.includes('zip') || type?.includes('rar')) return <FolderZipIcon className="file-icon zip" />;
    return <InsertDriveFileIcon className="file-icon default" />;
  };

  // Fayl hajmini formatlash
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Sanani formatlash
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
      if (!isValid(date)) return '';
      return format(date, 'd MMM yyyy, HH:mm', { locale: uz });
    } catch {
      return '';
    }
  };

  // Faylni base64 ga o'girish
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Faylni tekshirish
  const validateFile = (file) => {
    if (!file) return 'Fayl tanlanmadi';
    if (file.size > MAX_FILE_SIZE) {
      return `Fayl hajmi ${formatFileSize(MAX_FILE_SIZE)} dan oshmasligi kerak`;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Bu fayl turi qo\'llab-quvvatlanmaydi';
    }
    if (attachments.length >= maxFiles) {
      return `Maksimal ${maxFiles} ta fayl biriktirish mumkin`;
    }
    return null;
  };

  // Faylni yuklash
  const handleFileUpload = async (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setTimeout(() => setError(null), 3000);
      return;
    }

    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const attachment = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        data: base64,
        uploadedAt: new Date().toISOString()
      };
      onAddAttachment && onAddAttachment(attachment);
    } catch {
      setError('Faylni yuklashda xatolik yuz berdi');
      setTimeout(() => setError(null), 3000);
    } finally {
      setUploading(false);
    }
  };

  // Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // Fayl tanlash
  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
    e.target.value = '';
  };

  // Faylni yuklab olish
  const handleDownload = (attachment) => {
    const link = document.createElement('a');
    link.href = attachment.data;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Ko'rib chiqish uchun ochish
  const canPreview = (type) => {
    return type?.startsWith('image/') || type === 'application/pdf';
  };

  return (
    <div className="file-attachments">
      <div className="attachments-header">
        <AttachFileIcon />
        <h3>Fayllar</h3>
        <span className="attachments-count">
          {attachments.length}/{maxFiles}
        </span>
      </div>

      {/* Xatolik xabari */}
      {error && (
        <div className="error-message">
          <ErrorIcon />
          <span>{error}</span>
        </div>
      )}

      {/* Yuklash maydoni */}
      {attachments.length < maxFiles && (
        <div
          className={`upload-zone ${isDragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept={ALLOWED_TYPES.join(',')}
            hidden
          />
          
          {uploading ? (
            <div className="upload-loading">
              <div className="spinner"></div>
              <span>Yuklanmoqda...</span>
            </div>
          ) : (
            <>
              <CloudUploadIcon className="upload-icon" />
              <div className="upload-text">
                <p>Faylni bu yerga tashlang yoki <span>tanlang</span></p>
                <span className="upload-hint">
                  Maks. {formatFileSize(MAX_FILE_SIZE)} | Rasm, PDF, Word, Excel
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Biriktirilgan fayllar */}
      {attachments.length === 0 ? (
        <div className="no-attachments">
          <AttachFileIcon className="empty-icon" />
          <p>Hali fayllar biriktirilmagan</p>
        </div>
      ) : (
        <div className="attachments-list">
          {attachments.map(attachment => (
            <div key={attachment.id} className="attachment-item">
              <div className="attachment-preview">
                {attachment.type?.startsWith('image/') ? (
                  <img src={attachment.data} alt={attachment.name} />
                ) : (
                  getFileIcon(attachment.type, attachment.name)
                )}
              </div>

              <div className="attachment-info">
                <h4 className="attachment-name" title={attachment.name}>
                  {attachment.name}
                </h4>
                <div className="attachment-meta">
                  <span>{formatFileSize(attachment.size)}</span>
                  <span>•</span>
                  <span>{formatDate(attachment.uploadedAt)}</span>
                </div>
              </div>

              <div className="attachment-actions">
                {canPreview(attachment.type) && (
                  <button
                    className="preview-btn"
                    onClick={() => setPreviewFile(attachment)}
                    title="Ko'rib chiqish"
                  >
                    <VisibilityIcon />
                  </button>
                )}
                <button
                  className="download-btn"
                  onClick={() => handleDownload(attachment)}
                  title="Yuklab olish"
                >
                  <DownloadIcon />
                </button>
                <button
                  className="remove-btn"
                  onClick={() => onRemoveAttachment && onRemoveAttachment(attachment.id)}
                  title="O'chirish"
                >
                  <DeleteIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ko'rib chiqish modali */}
      {previewFile && (
        <div className="preview-modal" onClick={() => setPreviewFile(null)}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <h4>{previewFile.name}</h4>
              <button className="close-btn" onClick={() => setPreviewFile(null)}>
                <CloseIcon />
              </button>
            </div>
            <div className="preview-body">
              {previewFile.type?.startsWith('image/') ? (
                <img src={previewFile.data} alt={previewFile.name} />
              ) : previewFile.type === 'application/pdf' ? (
                <iframe 
                  src={previewFile.data} 
                  title={previewFile.name}
                  width="100%" 
                  height="100%"
                />
              ) : null}
            </div>
            <div className="preview-footer">
              <span>{formatFileSize(previewFile.size)}</span>
              <button onClick={() => handleDownload(previewFile)}>
                <DownloadIcon />
                Yuklab olish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileAttachments;
