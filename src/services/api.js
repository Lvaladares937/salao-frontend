import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
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