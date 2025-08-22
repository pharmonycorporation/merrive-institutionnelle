import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  Service, 
  Provider, 
  SearchFilters, 
  DashboardStats, 
  AuthResponse, 
  LoginCredentials,
  ApiResponse 
} from '@/types';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour ajouter le token d'authentification
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Intercepteur pour gérer les erreurs
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentification
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.api.post('/auth/institutional/login', credentials);
    return response.data.data;
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get('/auth/me');
    return response.data.data;
  }

  // Services (Projects dans l'API)
  async getServices(filters?: SearchFilters): Promise<Service[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    const response: AxiosResponse<ApiResponse<Service[]>> = await this.api.get(`/projects/search/global?${params.toString()}`);
    return response.data.data.projects || response.data.data;
  }

  async getServiceById(id: string): Promise<Service> {
    const response: AxiosResponse<ApiResponse<Service>> = await this.api.get(`/projects/${id}`);
    return response.data.data;
  }

  async getServicesByProvider(providerId: string): Promise<Service[]> {
    const response: AxiosResponse<ApiResponse<Service[]>> = await this.api.get(`/projects/artisan/${providerId}`);
    return response.data.data.projects || response.data.data;
  }

  // Providers
  async getProviders(): Promise<Provider[]> {
    const response: AxiosResponse<ApiResponse<Provider[]>> = await this.api.get('/providers');
    return response.data.data;
  }

  async getProviderById(id: string): Promise<Provider> {
    const response: AxiosResponse<ApiResponse<Provider>> = await this.api.get(`/providers/${id}`);
    return response.data.data;
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response: AxiosResponse<ApiResponse<DashboardStats>> = await this.api.get('/dashboard/stats/global');
    return response.data.data;
  }

  // Médias
  async getServiceMedia(serviceId: string): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get(`/projects/${serviceId}`);
    const project = response.data.data;
    return project.files || [];
  }

  // Recherche
  async searchServices(query: string, filters?: SearchFilters): Promise<Service[]> {
    const params = new URLSearchParams({ search: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    const response: AxiosResponse<ApiResponse<Service[]>> = await this.api.get(`/projects/search/global?${params.toString()}`);
    return response.data.data.projects || response.data.data;
  }

  // Statistiques
  async getServicesByYear(year: number): Promise<Service[]> {
    const response: AxiosResponse<ApiResponse<Service[]>> = await this.api.get(`/projects/year/${year}`);
    return response.data.data.projects || response.data.data;
  }

  async getServicesByCategory(category: string): Promise<Service[]> {
    const response: AxiosResponse<ApiResponse<Service[]>> = await this.api.get(`/projects/category/${category}`);
    return response.data.data.projects || response.data.data;
  }

  // ============ Méthodes pour la Bibliothèque ============

  /**
   * Obtenir les statistiques par année
   */
  async getLibraryYears(): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get('/library/years');
    return response.data.data;
  }

  /**
   * Obtenir les catégories d'une année
   */
  async getLibraryYearCategories(year: number): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get(`/library/years/${year}/categories`);
    return response.data.data;
  }

  /**
   * Obtenir les projets d'une catégorie pour une année
   */
  async getLibraryCategoryProjects(
    year: number,
    category: string,
    page = 1,
    limit = 10,
    search?: string
  ): Promise<{
    projects: Service[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search) {
      params.append('search', search);
    }

    const response: AxiosResponse<ApiResponse<any>> = await this.api.get(
      `/library/years/${year}/categories/${encodeURIComponent(category)}/projects?${params.toString()}`
    );
    
    return response.data.data;
  }

  /**
   * Obtenir les statistiques globales de la bibliothèque
   */
  async getLibraryStats(): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get('/library/stats');
    return response.data.data;
  }
}

export const apiService = new ApiService();
export default apiService;
