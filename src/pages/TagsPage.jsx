import { useState } from 'react';
import TagManager from '../components/TagManager/TagManager';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import './TagsPage.css';

const TagsPage = () => {
  const [tags, setTags] = useState(() => {
    // LocalStorage dan teglarni yuklash
    const saved = localStorage.getItem('tags');
    return saved ? JSON.parse(saved) : [];
  });

  // Tegni saqlash
  const saveTags = (newTags) => {
    setTags(newTags);
    localStorage.setItem('tags', JSON.stringify(newTags));
  };

  // Yangi teg qo'shish
  const handleAddTag = (tag) => {
    const newTags = [...tags, tag];
    saveTags(newTags);
  };

  // Tegni tahrirlash
  const handleEditTag = (tagId, updatedTag) => {
    const newTags = tags.map(t => t.id === tagId ? updatedTag : t);
    saveTags(newTags);
  };

  // Tegni o'chirish
  const handleDeleteTag = (tagId) => {
    const newTags = tags.filter(t => t.id !== tagId);
    saveTags(newTags);
  };

  // Teg bo'yicha filtrlash
  const handleFilterByTag = (tag) => {
    if (tag) {
      // Agar DashboardPage ga o'tish kerak bo'lsa
      localStorage.setItem('filterTag', JSON.stringify(tag));
      // navigate('/dashboard'); // agar routing bo'lsa
    } else {
      localStorage.removeItem('filterTag');
    }
  };

  return (
    <div className="tags-page">
      <div className="tags-page-header">
        <LocalOfferIcon />
        <h1>Teglar boshqaruvi</h1>
      </div>

      <div className="tags-page-content">
        <TagManager
          tags={tags}
          onAddTag={handleAddTag}
          onEditTag={handleEditTag}
          onDeleteTag={handleDeleteTag}
          onFilterByTag={handleFilterByTag}
        />
      </div>
    </div>
  );
};

export default TagsPage;
