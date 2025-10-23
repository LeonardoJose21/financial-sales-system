import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor to add token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async getCaptcha() {
    const response = await this.api.get('/auth/captcha');
    return response.data;
  }

  async login(credentials) {
    const response = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  async logout() {
    const response = await this.api.post('/auth/logout');
    return response.data;
  }

  // User endpoints
  async getUsers(params) {
    const response = await this.api.get('/users', { params });
    return response.data;
  }

  async getUserById(id) {
    const response = await this.api.get(`/users/${id}`);
    return response.data;
  }

  async registerUser(userData) {
    const response = await this.api.post('/auth/register', userData);
    return response.data;
  }


  async updateUser(id, userData) {
    const response = await this.api.put(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id) {
    const response = await this.api.delete(`/users/${id}`);
    return response.data;
  }

  async getRoles() {
    const response = await this.api.get('/users/roles');
    return response.data;
  }

  // Sale endpoints
  async getSales(params) {
    const response = await this.api.get('/sales', { params });
    return response.data;
  }

  async getSaleById(id) {
    const response = await this.api.get(`/sales/${id}`);
    return response.data;
  }

  async createSale(saleData) {
    const response = await this.api.post('/sales', saleData);
    return response.data;
  }

  async updateSale(id, saleData) {
    const response = await this.api.put(`/sales/${id}`, saleData);
    return response.data;
  }

  async deleteSale(id) {
    const response = await this.api.delete(`/sales/${id}`);
    return response.data;
  }

  async updateSaleStatus(id, status) {
    const response = await this.api.patch(`/sales/${id}/status`, { status });
    return response.data;
  }

  async getTotalAmount() {
    const response = await this.api.get('/sales/total');
    return response.data;
  }

  async getStatistics() {
    const response = await this.api.get('/sales/statistics');
    return response.data;
  }
}

const apiService = new ApiService();
export default apiService;