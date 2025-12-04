import React, { useState } from 'react';
import { FaPlus, FaPlusCircle, FaStickyNote } from 'react-icons/fa';

const NoteForm = ({ onCreateNote, categories, onAddCategory }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newNote = {
      title: title.trim(),
      content: content.trim(),
      categories: selectedCategories
    };

    console.log('Form submitting with:', {
      title: newNote.title,
      content: newNote.content,
      selectedCategoryIds: newNote.categories
    });

    const success = await onCreateNote(newNote);
    if (success) {
      setTitle('');
      setContent('');
      setSelectedCategories([]);
    }
  };

  const handleCategorySelect = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="note-form">
      <input
        type="text"
        placeholder="Note Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Note Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        rows="4"
      />

      {/* <div className="category-selection">
        <label>Select Categories:</label>
        <div className="category-checkboxes">
          {categories.map(category => (
            <div key={category.id} className="category-checkbox">
              <input
                type="checkbox"
                id={`cat-${category.id}`}
                checked={selectedCategories.includes(category.id)}
                onChange={() => handleCategorySelect(category.id)}
              />
              <label htmlFor={`cat-${category.id}`}>{category.name}</label>
            </div>
          ))}
        </div>
      </div> */}

      <div style={{ margin: '20px 0' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
          Select Categories:
        </label>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {categories.map(category => {
            const isSelected = selectedCategories.includes(category.id);

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategorySelect(category.id)}
                style={{
                  padding: '6px 14px',
                  backgroundColor: isSelected ? '#f0f9ff' : '#f9fafb',
                  color: isSelected ? '#1e40af' : '#6b7280',
                  border: '1px solid #e5e7eb',
                  borderRadius: '16px',
                  cursor: 'pointer'
                }}
              >
                {category.name}
                {isSelected && ' ✓'}
              </button>
            );
          })}
        </div>
      </div>


      <button type="submit"><FaPlus /> Create Note</button>
    </form>
  );
};

export default NoteForm;