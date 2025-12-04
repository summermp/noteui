import React, { useState, useEffect } from 'react';
import NoteForm from './components/NoteForm';
import NoteList from './components/NoteList';
import ArchivedNotes from './components/ArchivedNotes';
import CategoryManager from './components/CategoryManager';
import { noteAPI, authAPI } from './services/api';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState('active');
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    console.log(loading);
    console.log(loginForm, "|");

    if (token) {
      setIsAuthenticated(true);
      loadActiveNotes();
      loadCategories();
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    // Debug: Show exactly what we have
    console.log("🔍 Form state before sending:", {
      username: loginForm.username,
      password: loginForm.password ? "***" : "(empty)"
    });

    if (!loginForm.username.trim() || !loginForm.password.trim()) {
      alert(`Please fill both fields:
Username: "${loginForm.username || 'empty'}"
Password: "${loginForm.password ? 'filled' : 'empty'}"`);
      return;
    }

    setLoading(true);

    try {
      console.log("🚀 Calling API with:", {
        username: loginForm.username,
        password: "***" // Don't log actual password
      });

      // This sends: { "username": "value", "password": "value" }
      const response = await authAPI.login(loginForm.username, loginForm.password);

      console.log("✅ Server response:", response.data);

      // Extract token from response
      const { token, username: serverUsername } = response.data;

      if (!token) {
        throw new Error('No authentication token received');
      }

      // Store the token (it's base64 encoded "username:password")
      localStorage.setItem('token', token);
      localStorage.setItem('username', serverUsername || loginForm.username);
      setIsAuthenticated(true);

      console.log("✅ Token stored:", token.substring(0, 20) + "...");

      // Load user data
      await loadActiveNotes();
      await loadCategories();

      console.log("✅ Login successful!");

    } catch (error) {
      console.error("❌ Login failed:", error);

      // Check what exactly failed
      if (error.response) {
        console.error("Server responded with:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });

        if (error.response.status === 400) {
          alert('Bad request. Make sure username/password are correct.');
        } else if (error.response.status === 401) {
          alert('Invalid credentials');
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
        alert('No response from server. Check if backend is running.');
      } else {
        console.error("Request setup error:", error.message);
        alert('Error setting up request: ' + error.message);
      }

      // Clear any invalid auth
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      setIsAuthenticated(false);

    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setLoginForm({ username: '', password: '' });
  };

  // ========== NOTE FUNCTIONS ==========
  const loadActiveNotes = async () => {
    try {
      const response = await noteAPI.getActiveNotes();
      setNotes(response.data);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const loadArchivedNotes = async () => {
    try {
      const response = await noteAPI.getArchivedNotes();
      setNotes(response.data);
    } catch (error) {
      console.error('Error loading archived notes:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await noteAPI.getAllCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadNotesByCategory = async (categoryName) => {
    try {
      const response = await noteAPI.getNotesByCategory(categoryName);
      setNotes(response.data);
    } catch (error) {
      console.error('Error loading notes by category:', error);
    }
  };

  const handleCreateNote = async (noteData) => {
    try {
      if (noteData.categories && noteData.categories.length > 0) {
        await noteAPI.createNoteWithCategories(
          { title: noteData.title, content: noteData.content },
          noteData.categories
        );
      } else {
        await noteAPI.createNote({
          title: noteData.title,
          content: noteData.content
        });
      }

      if (activeView === 'active') {
        loadActiveNotes();
      } else if (activeView === 'archived') {
        loadArchivedNotes();
      }
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Failed to create note');
    }
  };

  const handleUpdateNote = async (id, updatedNote) => {
    try {
      await noteAPI.updateNote(id, updatedNote);
      if (activeView === 'active') {
        loadActiveNotes();
      } else if (activeView === 'archived') {
        loadArchivedNotes();
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await noteAPI.deleteNote(id);
      if (activeView === 'active') {
        loadActiveNotes();
      } else if (activeView === 'archived') {
        loadArchivedNotes();
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleArchiveNote = async (id) => {
    try {
      await noteAPI.archiveNote(id);
      loadActiveNotes();
    } catch (error) {
      console.error('Error archiving note:', error);
    }
  };

  const handleUnarchiveNote = async (id) => {
    try {
      await noteAPI.unarchiveNote(id);
      loadArchivedNotes();
    } catch (error) {
      console.error('Error unarchiving note:', error);
    }
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    if (category === 'all') {
      if (activeView === 'active') {
        loadActiveNotes();
      } else if (activeView === 'archived') {
        loadArchivedNotes();
      }
    } else {
      loadNotesByCategory(category);
    }
  };

  const handleCreateCategory = async (categoryName) => {
    try {
      await noteAPI.createCategory(categoryName);
      loadCategories();
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await noteAPI.deleteCategory(id);
      loadCategories();
      if (selectedCategory !== 'all') {
        handleCategoryFilter('all');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleAddCategoryToNote = async (noteId, categoryId) => {
    try {
      await noteAPI.addCategoryToNote(noteId, categoryId);
      if (activeView === 'active') {
        loadActiveNotes();
      } else if (activeView === 'archived') {
        loadArchivedNotes();
      }
    } catch (error) {
      console.error('Error adding category to note:', error);
    }
  };

  const handleRemoveCategoryFromNote = async (noteId, categoryId) => {
    try {
      await noteAPI.removeCategoryFromNote(noteId, categoryId);
      if (activeView === 'active') {
        loadActiveNotes();
      } else if (activeView === 'archived') {
        loadArchivedNotes();
      }
    } catch (error) {
      console.error('Error removing category from note:', error);
    }
  };

  // ========== RENDER LOGIN FORM ==========
  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <div className="login-form">
          <h2>Login to NoteApp</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Username"
                autoFocus
                value={loginForm.username || ""}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                value={loginForm.password || ""}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" disabled={loading} onClick={() => {
              console.log('Current form state:', loginForm.username);
            }}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ========== RENDER NOTE APP ==========
  return (
    <div className="App">
      <header className="App-header">
        <h1>Note App</h1>
        <div className="header-right">
          <button onClick={handleLogout} className="logout-btn"
          style={{
            backgroundColor: 'red',
            fontSize:'bold'
          }}
          >
            Logout
          </button>
        </div>
        <nav>
          <button onClick={() => { setActiveView('active'); loadActiveNotes(); setSelectedCategory('all'); }}>
            Active Notes
          </button>
          <button
            style={{
              backgroundColor: activeView === 'archived' ? '#6c757d' : 'gray',
              color: activeView === 'archived' ? 'white' : '#fafdffff',
              border: '1px solid #dee2e6',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}

            onClick={() => { setActiveView('archived'); loadArchivedNotes(); setSelectedCategory('all'); }}>
            Archived Notes
          </button>
          <button
            style={{
              backgroundColor: activeView === 'archived' ? 'orange' : 'orange',
              color: activeView === 'archived' ? 'white' : '#fafdffff',
              border: '1px solid #dee2e6',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onClick={() => setActiveView('categories')}>
            Manage Categories
          </button>
        </nav>
      </header>

      <main>
        {activeView === 'active' || activeView === 'archived' ? (
          <>
            <NoteForm
              onCreateNote={handleCreateNote}
              categories={categories}
              onAddCategory={handleAddCategoryToNote}
            />

            <div className="filter-section">
              <label>Filter by Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {activeView === 'active' ? (
              <NoteList
                notes={notes}
                onUpdateNote={handleUpdateNote}
                onDeleteNote={handleDeleteNote}
                onArchiveNote={handleArchiveNote}
                categories={categories}
                onAddCategoryToNote={handleAddCategoryToNote}
                onRemoveCategoryFromNote={handleRemoveCategoryFromNote}
              />
            ) : (
              <ArchivedNotes
                notes={notes}
                onUnarchiveNote={handleUnarchiveNote}
                onDeleteNote={handleDeleteNote}
                categories={categories}
              />
            )}
          </>
        ) : (
          <CategoryManager
            categories={categories}
            onCreateCategory={handleCreateCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}
      </main>
    </div>
  );
}

export default App;