import React, { useState } from 'react';

const NoteItem = ({ 
  note, 
  onUpdateNote, 
  onDeleteNote, 
  onArchiveNote, 
  categories, 
  onAddCategoryToNote,
  onRemoveCategoryFromNote,
  isArchived = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(note.title);
  const [editedContent, setEditedContent] = useState(note.content);
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleUpdate = () => {
    const updatedNote = {
      title: editedTitle.trim(),
      content: editedContent.trim()
    };
    onUpdateNote(note.id, updatedNote);
    setIsEditing(false);
  };

  const handleAddCategory = () => {
    if (selectedCategory && !note.categories?.some(cat => cat.id === parseInt(selectedCategory))) {
      onAddCategoryToNote(note.id, parseInt(selectedCategory));
      setSelectedCategory('');
    }
  };

  const handleRemoveCategory = (categoryId) => {
    onRemoveCategoryFromNote(note.id, categoryId);
  };

  return (
    <div className={`note-item ${isArchived ? 'archived' : ''}`}>
      {isEditing ? (
        <div className="edit-mode">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="edit-input"
          />
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="edit-textarea"
            rows="3"
          />
          <div className="edit-actions">
            <button onClick={handleUpdate}>Save</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="view-mode">
          <h3>{note.title}</h3>
          <p>{note.content}</p>
          
          <div className="note-categories">
            <strong>Categories:</strong>
            {note.categories && note.categories.length > 0 ? (
              <div className="category-tags">
                {note.categories.map(category => (
                  <span key={category.id} className="category-tag">
                    {category.name}
                    {!isArchived && (
                      <button 
                        className="remove-category-btn"
                        onClick={() => handleRemoveCategory(category.id)}
                        title="Remove category"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <span className="no-categories">No categories assigned</span>
            )}
          </div>

          {!isArchived && (
            <div className="add-category-section">
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-select"
              >
                <option value="">Add a category</option>
                {categories
                  .filter(cat => !note.categories?.some(noteCat => noteCat.id === cat.id))
                  .map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
              <button 
                onClick={handleAddCategory}
                disabled={!selectedCategory}
                className="add-category-btn"
              >
                Add
              </button>
            </div>
          )}

          <div className="note-actions">
            {!isArchived && (
              <>
                <button onClick={() => setIsEditing(true)}>Edit</button>
                <button style={{
                  backgroundColor:"orange",
                  color:'white'
                }}
                onClick={() => onArchiveNote(note.id)}>Archive</button>
              </>
            )}
            {isArchived && (
              <button onClick={() => onArchiveNote(note.id)}>Unarchive</button>
            )}
            <button onClick={() => onDeleteNote(note.id)} className="delete-btn">
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteItem;