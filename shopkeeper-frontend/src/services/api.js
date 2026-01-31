import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

export const validateSession = async (sessionId) => {
  const response = await api.get(`/api/session/${sessionId}`)
  return response.data
}

export const getSession = async (sessionId) => {
  const response = await api.get(`/api/session/${sessionId}`)
  return response.data
}

export const completeSession = async (sessionId) => {
  const response = await api.post(`/api/session/${sessionId}/complete`)
  return response.data
}

export const getFileUrl = (sessionId, fileId) => {
  return `${API_BASE_URL}/api/file/${sessionId}/${fileId}`
}