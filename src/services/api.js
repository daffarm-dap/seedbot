// ========================================
// SEEDBOT - API SERVICE (UPDATED & CLEAN)
// ========================================

// Use Vite proxy in development, or direct URL in production
const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV 
    ? "/api"  // Use Vite proxy in development
    : "http://localhost:5000/api"  // Direct URL in production
);

// ========================================
// HELPER FUNCTIONS
// ========================================

const getAuthToken = () => localStorage.getItem("token");

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (response) => {
  // Handle network errors
  if (!response) {
    throw new Error("Network error: Tidak dapat terhubung ke server. Pastikan backend sudah berjalan.");
  }

  let data;
  try {
    const text = await response.text();
    if (!text) {
      throw new Error("Empty response from server");
    }
    data = JSON.parse(text);
  } catch (error) {
    // If response is not JSON, create error message
    if (error.message === "Empty response from server") {
      throw new Error("Server mengembalikan response kosong");
    }
    throw new Error(`Server error: ${response.status} ${response.statusText || "Unknown error"}`);
  }
  
  if (!response.ok) {
    const errorMessage = data.error || data.message || `Server error: ${response.status}`;
    throw new Error(errorMessage);
  }
  return data;
};

// ========================================
// AUTH API
// ========================================

export const authAPI = {
  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await handleResponse(response);

    // ✅ Simpan token + user
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  },

  isAuthenticated: () => !!getAuthToken(),

  me: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  forgotPassword: async (username) => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    return handleResponse(response);
  },

  verifyResetToken: async (username, token) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-reset-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, token }),
    });
    return handleResponse(response);
  },

  resetPassword: async (username, token, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, token, newPassword }),
    });
    return handleResponse(response);
  },
};

// ========================================
// NEWS API
// ========================================

export const newsAPI = {
  getAll: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/news`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Don't throw on network errors, let handleResponse handle it
      }).catch((error) => {
        // Network error (Failed to fetch, CORS, etc.)
        console.error("Network error:", error);
        throw new Error("Tidak dapat terhubung ke server. Pastikan backend sudah berjalan di http://localhost:5000");
      });
      
      return handleResponse(res);
    } catch (error) {
      // Re-throw with better error message
      if (error.message && error.message.includes("Failed to fetch")) {
        throw new Error("Tidak dapat terhubung ke server. Pastikan backend sudah berjalan di http://localhost:5000");
      }
      // If it's already our formatted error, just re-throw
      if (error.message && error.message.includes("Tidak dapat terhubung")) {
        throw error;
      }
      // Otherwise, wrap the error
      throw new Error(error.message || "Gagal memuat berita");
    }
  },

  getById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/news/${id}`);
    return handleResponse(res);
  },

  create: async (newsData) => {
    const res = await fetch(`${API_BASE_URL}/news`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(newsData),
    });
    return handleResponse(res);
  },

  update: async (id, newsData) => {
    const res = await fetch(`${API_BASE_URL}/news/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(newsData),
    });
    return handleResponse(res);
  },

  delete: async (id) => {
    const res = await fetch(`${API_BASE_URL}/news/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("file", file); // Changed from "image" to "file" to match backend

    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/news/upload`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        // Don't set Content-Type, let browser set it with boundary for FormData
      },
      body: formData,
    });

    return handleResponse(res);
  },
};

// ========================================
// ADMIN API
// ========================================

export const adminAPI = {
  getUsers: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  createUser: async (data) => {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  updateUser: async (id, data) => {
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  deleteUser: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getParameters: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/parameters`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  updateParameters: async (params) => {
    const res = await fetch(`${API_BASE_URL}/admin/parameters`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
    });
    return handleResponse(res);
  },

  changePassword: async (passwordData) => {
    const res = await fetch(`${API_BASE_URL}/admin/change-password`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(passwordData),
    });
    return handleResponse(res);
  },
};

// ========================================
// FARMER API
// ========================================

export const farmerAPI = {
  getSensorData: async () => {
    const res = await fetch(`${API_BASE_URL}/farmer/sensor-data`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  updateSensorData: async (sensorData) => {
    const res = await fetch(`${API_BASE_URL}/farmer/sensor-data`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(sensorData),
    });
    return handleResponse(res);
  },

  getRobotStatus: async () => {
    const res = await fetch(`${API_BASE_URL}/farmer/robot-status`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getRobotHistory: async () => {
    const res = await fetch(`${API_BASE_URL}/farmer/robot-history`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  createRobotHistory: async (historyData) => {
    const res = await fetch(`${API_BASE_URL}/farmer/robot-history`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(historyData),
    });
    return handleResponse(res);
  },

  predictCrop: async (sensorData) => {
    const res = await fetch(`${API_BASE_URL}/farmer/predict-crop`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(sensorData),
    });
    return handleResponse(res);
  },

  updateHistoryStatus: async (isSuitable) => {
    const res = await fetch(`${API_BASE_URL}/farmer/update-history-status`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ isSuitable }),
    });
    return handleResponse(res);
  },

  getMappings: async () => {
    const res = await fetch(`${API_BASE_URL}/farmer/mappings`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getMapping: async (id) => {
    const res = await fetch(`${API_BASE_URL}/farmer/mappings/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  createMapping: async (mappingData) => {
    const res = await fetch(`${API_BASE_URL}/farmer/mappings`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(mappingData),
    });
    return handleResponse(res);
  },

  updateMapping: async (id, mappingData) => {
    const res = await fetch(`${API_BASE_URL}/farmer/mappings/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(mappingData),
    });
    return handleResponse(res);
  },

  deleteMapping: async (id) => {
    const res = await fetch(`${API_BASE_URL}/farmer/mappings/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getParameters: async () => {
    const res = await fetch(`${API_BASE_URL}/farmer/parameters`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  updateParameters: async (parametersData) => {
    const res = await fetch(`${API_BASE_URL}/farmer/parameters`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(parametersData),
    });
    return handleResponse(res);
  },

  getDefaultParameters: async () => {
    const res = await fetch(`${API_BASE_URL}/farmer/parameters/default`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getRobotStatus: async () => {
    const res = await fetch(`${API_BASE_URL}/farmer/robot-status`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  updateRobotStatus: async (statusData) => {
    const res = await fetch(`${API_BASE_URL}/farmer/robot-status`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(statusData),
    });
    return handleResponse(res);
  },

  robotControl: async (action) => {
    const res = await fetch(`${API_BASE_URL}/farmer/robot-control`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ action }),
    });
    return handleResponse(res);
  },

  changePassword: async (passwordData) => {
    const res = await fetch(`${API_BASE_URL}/farmer/change-password`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(passwordData),
    });
    return handleResponse(res);
  },
};

// ========================================
// EXPORT DEFAULT (for convenience)
// ========================================

const api = {
  auth: authAPI,
  news: newsAPI,
  admin: adminAPI,
  farmer: farmerAPI,
};

export default api;
