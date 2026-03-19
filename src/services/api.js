import axios from 'axios';

// Usa a variável de ambiente ou fallback para localhost
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para logs (opcional)
api.interceptors.request.use(request => {
  console.log('Iniciando requisição:', request.url);
  return request;
});

api.interceptors.response.use(
  response => {
    console.log('Resposta recebida:', response.data);
    return response;
  },
  error => {
    console.error('Erro na requisição:', error);
    return Promise.reject(error);
  }
);

export default api;
