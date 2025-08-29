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
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://merrive-api-v2.onrender.com';
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
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/institutional/login', credentials);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<AuthResponse> = await this.api.get('/auth/me');
    return response.data.user;
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
    
    const response: AxiosResponse<Service[]> = await this.api.get(`/projects/search/global?${params.toString()}`);
    return response.data;
  }

  async getServiceById(id: string): Promise<Service> {
    const response: AxiosResponse<Service> = await this.api.get(`/projects/${id}`);
    return response.data;
  }

  async getServicesByProvider(providerId: string): Promise<Service[]> {
    const response: AxiosResponse<Service[]> = await this.api.get(`/projects/artisan/${providerId}`);
    return response.data;
  }

  // Providers
  async getProviders(): Promise<Provider[]> {
    const response: AxiosResponse<Provider[]> = await this.api.get('/artisans');
    return response.data;
  }

  async getProviderById(id: string): Promise<Provider> {
    const response: AxiosResponse<Provider> = await this.api.get(`/artisans/${id}`);
    return response.data;
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response: AxiosResponse<DashboardStats> = await this.api.get('/dashboard/stats/global');
    return response.data;
  }

  // Médias
  async getServiceMedia(serviceId: string): Promise<any[]> {
    const response: AxiosResponse<Service> = await this.api.get(`/projects/${serviceId}`);
    const project = response.data;
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
    
    const response: AxiosResponse<Service[]> = await this.api.get(`/projects/search/global?${params.toString()}`);
    return response.data;
  }

  // Statistiques
  async getServicesByYear(year: number): Promise<Service[]> {
    const response: AxiosResponse<Service[]> = await this.api.get(`/projects/year/${year}`);
    return response.data;
  }

  async getServicesByCategory(category: string): Promise<Service[]> {
    const response: AxiosResponse<Service[]> = await this.api.get(`/projects/category/${category}`);
    return response.data;
  }

  // ============ Méthodes pour la Bibliothèque ============
  // Note: Ces endpoints peuvent ne pas exister dans l'API actuelle
  // Utilisation des endpoints existants comme fallback

  /**
   * Obtenir les statistiques par année (utilise les projets existants)
   */
  async getLibraryYears(): Promise<any[]> {
    try {
      // Essayer d'abord l'endpoint spécifique à la bibliothèque
      const response: AxiosResponse<any[]> = await this.api.get('/library/years');
      return response.data;
    } catch (error) {
      // Fallback: utiliser les projets pour générer les années
      console.warn('Endpoint /library/years non disponible, utilisation du fallback');
      try {
        const projects = await this.getServices();
        // S'assurer que projects est un tableau
        const projectsArray = Array.isArray(projects) ? projects : [];
        const yearMap = new Map();
        
        projectsArray.forEach((project: Service) => {
          const year = new Date(project.createdAt).getFullYear();
          if (!yearMap.has(year)) {
            yearMap.set(year, { year, count: 0 });
          }
          yearMap.set(year, { year, count: yearMap.get(year).count + 1 });
        });
        
        return Array.from(yearMap.values()).sort((a, b) => b.year - a.year);
      } catch (fallbackError) {
        console.error('Erreur dans le fallback getLibraryYears:', fallbackError);
        return [];
      }
    }
  }

  /**
   * Obtenir les catégories d'une année
   */
  async getLibraryYearCategories(year: number): Promise<any[]> {
    try {
      const response: AxiosResponse<any[]> = await this.api.get(`/library/years/${year}/categories`);
      return response.data;
    } catch (error) {
      // Fallback: utiliser les projets filtrés par année
      console.warn(`Endpoint /library/years/${year}/categories non disponible, utilisation du fallback`);
      try {
        const projects = await this.getServicesByYear(year);
        // S'assurer que projects est un tableau
        const projectsArray = Array.isArray(projects) ? projects : [];
        const categoryMap = new Map();
        
        projectsArray.forEach((project: Service) => {
          const category = project.category || 'Non catégorisé';
          if (!categoryMap.has(category)) {
            categoryMap.set(category, { name: category, count: 0 });
          }
          categoryMap.set(category, { name: category, count: categoryMap.get(category).count + 1 });
        });
        
        return Array.from(categoryMap.values());
      } catch (fallbackError) {
        console.error('Erreur dans le fallback getLibraryYearCategories:', fallbackError);
        return [];
      }
    }
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
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (search) {
        params.append('search', search);
      }

      const response: AxiosResponse<any> = await this.api.get(
        `/library/years/${year}/categories/${encodeURIComponent(category)}/projects?${params.toString()}`
      );
      
      return response.data;
    } catch (error) {
      // Fallback: filtrer manuellement les projets
      console.warn('Endpoint library/projects non disponible, utilisation du fallback');
      try {
        let projects = await this.getServicesByCategory(category);
        
        // S'assurer que projects est un tableau
        const projectsArray = Array.isArray(projects) ? projects : [];
        
        // Filtrer par année
        let filteredProjects = projectsArray.filter(p => new Date(p.createdAt).getFullYear() === year);
        
        // Filtrer par recherche si fournie
        if (search) {
          const searchLower = search.toLowerCase();
          filteredProjects = filteredProjects.filter(p => 
            p.name.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower)
          );
        }
        
        const total = filteredProjects.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const paginatedProjects = filteredProjects.slice(startIndex, startIndex + limit);
        
        return {
          projects: paginatedProjects,
          total,
          page,
          limit,
          totalPages
        };
      } catch (fallbackError) {
        console.error('Erreur dans le fallback getLibraryCategoryProjects:', fallbackError);
        return {
          projects: [],
          total: 0,
          page,
          limit,
          totalPages: 0
        };
      }
    }
  }

  /**
   * Obtenir les statistiques globales de la bibliothèque
   */
  async getLibraryStats(): Promise<any> {
    try {
      const response: AxiosResponse<any> = await this.api.get('/library/stats');
      return response.data;
    } catch (error) {
      // Fallback: utiliser les stats du dashboard
      console.warn('Endpoint /library/stats non disponible, utilisation du fallback dashboard');
      return await this.getDashboardStats();
    }
  }
}

export const apiService = new ApiService();
export default apiService;
