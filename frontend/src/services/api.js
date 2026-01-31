import axios from 'axios';

// Cloud Relay API - Uses environment variable in production
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api/customer';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

export async function checkShopkeeperStatus() {
  try {
    const response = await axios.get(`${API_BASE}/shopkeeper/status`);
    return response.data;
  } catch (error) {
    console.error('Status check failed:', error);
    return { online: false, message: 'Could not check status' };
  }
}

export async function uploadFiles(files) {
  try {
    // Step 1: Check if shopkeeper is online
    const statusCheck = await checkShopkeeperStatus();
    if (!statusCheck.online) {
      throw new Error('SHOPKEEPER_OFFLINE');
    }

    // Step 2: Create a session
    const sessionResponse = await axios.post(`${API_BASE}/sessions/create`, {
      customerName: 'Customer' // Optional
    });
    
    const { sessionId } = sessionResponse.data;
    
    // Step 3: Upload files (real-time streaming)
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const uploadResponse = await axios.post(
      `${API_BASE}/sessions/${sessionId}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          return percentCompleted;
        }
      }
    );

    return {
      sessionId: sessionId,
      filesUploaded: uploadResponse.data.filesUploaded,
      files: uploadResponse.data.files,
      message: uploadResponse.data.message
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error(error.response?.data?.message || 'Upload failed');
  }
}

export async function getSessionStatus(sessionId) {
  try {
    const response = await api.get(`/sessions/${sessionId}/status`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch session');
  }
}
