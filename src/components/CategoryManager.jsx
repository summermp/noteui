import React, { useState } from 'react';

const CategoryManager = ({ categories, onCreateCategory, onDeleteCategory }) => {
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      onCreateCategory(newCategoryName.trim());
      setNewCategoryName('');
    }
  };

  return (
    <div className="category-manager">
      <h2>Manage Categories</h2>
      
      <form onSubmit={handleSubmit} className="category-form">
        <input
          type="text"
          placeholder="New category name"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          required
        />
        <button type="submit">Create Category</button>
      </form>

      <div className="categories-list">
        <h3>Existing Categories ({categories.length})</h3>
        {categories.length === 0 ? (
          <p>No categories created yet.</p>
        ) : (
          <ul>
            {categories.map(category => (
              <li key={category.id} className="category-item">
                <span>{category.name}</span>
                <button 
                  onClick={() => onDeleteCategory(category.id)}
                  className="delete-category-btn"
                  title="Delete category"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CategoryManager;