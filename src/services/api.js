import axios from 'axios';

// Create base API without auth
const API = axios.create({
  // URL LOCALHOST
  // baseURL: 'http://localhost:8080/api',
  // URL REMOTE
  baseURL: 'https://notesapp-a6cuddbjdkeza7ft.canadacentral-01.azurewebsites.net/api',
  withCredentials: true,
  headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  }
});

// Auth API
export const authAPI = {
  login: async (username, password) => {
    try {
      console.log('📤 Sending to backend:', { username, password: '***' });

      // Your backend expects: { "username": "value", "password": "value" }
      const response = await API.post('/auth/login', {
        username: username,  // Must be exactly "username"
        password: password   // Must be exactly "password"
      });

      console.log('✅ Backend response:', response.data);
      return response;

    } catch (error) {
      console.error('❌ Login API error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // Alternative: If backend expects credentials in body instead of Basic Auth header
  loginWithBody: (username, password) => {
    return API.post('/auth/login', {
      username: username,
      password: password
    })
      .then(response => {
        const { token, username: returnedUsername } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('username', returnedUsername || username);
        localStorage.setItem('authType', response.data.authType || 'Basic');

        return response;
      });
  },

  // Clear stored credentials
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('authType');
  },

  // Check if user is logged in
  isLoggedIn: () => {
    return !!localStorage.getItem('token');
  },

  // Get current user info
  getCurrentUser: () => {
    return {
      username: localStorage.getItem('username'),
      authType: localStorage.getItem('authType')
    };
  }
};

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  const authType = localStorage.getItem('authType') || 'Basic';

  if (token) {
    return {
      'Authorization': `${authType} ${token}`
    };
  }
  return {};
};

// Add auth header to all requests automatically using interceptors
// This is cleaner than adding headers to each call
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const authType = localStorage.getItem('authType') || 'Basic';

    if (token && !config.headers['Authorization']) {
      config.headers['Authorization'] = `${authType} ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Note API - Now simpler because interceptors handle auth headers
export const noteAPI = {
  getAllNotes: () => {
    return API.get('/notes');
  },

  getActiveNotes: () => {
    return API.get('/notes/active');
  },

  getArchivedNotes: () => {
    return API.get('/notes/archived');
  },

  createNote: (note) => {
    return API.post('/notes', note)
      .then(response => {
        console.log('Success response:', response);
        return response;
      })
      .catch(error => {
        console.error('Full error details:', {
          status: error.response?.status,
          data: error.response?.data
        });
        throw error;
      });
  },

  updateNote: (id, note) => {
    return API.put(`/notes/${id}`, note);
  },

  deleteNote: (id) => {
    return API.delete(`/notes/${id}`);
  },

  archiveNote: (id) => {
    return API.post(`/notes/${id}/archive`, {});
  },

  unarchiveNote: (id) => {
    return API.post(`/notes/${id}/unarchive`, {});
  },

  getAllCategories: () => {
    return API.get('/categories');
  },

  createCategory: (name) => {
    return API.post(`/categories?name=${encodeURIComponent(name)}`, {});
  },

  deleteCategory: (id) => {
    return API.delete(`/categories/${id}`);
  },

  addCategoryToNote: (noteId, categoryId) => {
    return API.post(`/notes/${noteId}/categories/${categoryId}`, {});
  },

  removeCategoryFromNote: (noteId, categoryId) => {
    return API.delete(`/notes/${noteId}/categories/${categoryId}`);
  },

  getNotesByCategory: (categoryName) => {
    return API.get(`/notes/category/${categoryName}`);
  },

  createNoteWithCategories: (note, categories) => {
    let categoryString;
    if (Array.isArray(categories)) {
      categoryString = categories.join(',');
    } else if (typeof categories === 'string') {
      categoryString = categories;
    } else {
      categoryString = '';
    }

    categoryString = categoryString.split(',').map(cat => cat.trim()).join(',');

    return API.post(
      `/notes/with-categories?categories=${encodeURIComponent(categoryString)}`,
      note
    );
  },
};

// Add response interceptor for debugging and handling auth errors
API.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });

    // Handle unauthorized errors (401)
    if (error.response?.status === 401) {
      // Clear stored credentials and redirect to login
      authAPI.logout();
      // You might want to dispatch an event or redirect here
      window.dispatchEvent(new Event('unauthorized'));
    }

    return Promise.reject(error);
  }

);

