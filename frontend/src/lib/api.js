import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getProfile: () => api.get("/auth/profile"),
}

export const animacaoAPI = {
  getAll: (params) => api.get("/animacoes", { params }),
  getById: (id) => api.get(`/animacoes/${id}`),
  create: (data) => api.post("/animacoes", data),
  update: (id, data) => api.put(`/animacoes/${id}`, data),
  delete: (id) => api.delete(`/animacoes/${id}`),
}

export const avaliacaoAPI = {
  create: (data) => api.post("/avaliacoes", data),
  update: (id, data) => api.put(`/avaliacoes/${id}`, data),
  delete: (id) => api.delete(`/avaliacoes/${id}`),
  getByAnimacao: (animacaoId, params) => api.get(`/avaliacoes/animacao/${animacaoId}`, { params }),
  getMinhas: (params) => api.get("/avaliacoes/minhas", { params }),
  reportar: (id, data) => api.post(`/avaliacoes/${id}/reportar`, data),
}

export const listaAPI = {
  add: (data) => api.post("/lista", data),
  remove: (animacaoId) => api.delete(`/lista/${animacaoId}`),
  getMinha: (params) => api.get("/lista/minha", { params }), // ✅ CORRIGIDO
}

export const generoAPI = {
  getAll: () => api.get("/generos"),
  create: (data) => api.post("/generos", data),
}

export const statsAPI = {
  getDashboard: () => api.get("/stats/dashboard"),
  getRecentAnimacoes: (params) => api.get("/stats/animacoes/recentes", { params }),
  getUsuariosRecentes: (params) => api.get("/stats/usuarios/recentes", { params }),
}

export default api
