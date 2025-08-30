import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
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
  private apiNoAuth: AxiosInstance;
  private baseURL: string;
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;
  private subscribers: Array<(token: string) => void> = [];

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://merrive-api-v2.onrender.com';
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.apiNoAuth = axios.create({
      baseURL: this.baseURL,
      headers: { 'Content-Type': 'application/json' },
    });

    // Intercepteur pour ajouter le token d'authentification
    this.api.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers = config.headers || {};
          (config.headers as any).Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    // Intercepteur pour gérer les erreurs
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest: InternalAxiosRequestConfig & { _retry?: boolean } = error.config || {};

        // If unauthorized, try refresh flow once
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.handleTokenRefresh();

            // Update header and retry the original request
            originalRequest.headers = originalRequest.headers || {};
            (originalRequest.headers as any).Authorization = `Bearer ${newToken}`;
            return this.api.request(originalRequest);
          } catch (refreshErr) {
            // Refresh failed → clean and redirect
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private onRefreshed(token: string) {
    this.subscribers.forEach((cb) => cb(token));
    this.subscribers = [];
  }

  private subscribeTokenRefresh(cb: (token: string) => void) {
    this.subscribers.push(cb);
  }

  private async handleTokenRefresh(): Promise<string> {
    if (this.isRefreshing && this.refreshPromise) {
      return new Promise<string>((resolve) => {
        this.subscribeTokenRefresh(resolve);
      });
    }

    this.isRefreshing = true;
    this.refreshPromise = new Promise<string>(async (resolve, reject) => {
      try {
        if (typeof window === 'undefined') throw new Error('No window');
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('Missing refresh token');

        const res: AxiosResponse<AuthResponse> = await this.apiNoAuth.post('/auth/refresh', {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefresh, user } = res.data;
        localStorage.setItem('auth_token', accessToken);
        if (newRefresh) localStorage.setItem('refresh_token', newRefresh);
        if (user) localStorage.setItem('user', JSON.stringify(user));

        this.onRefreshed(accessToken);
        this.isRefreshing = false;
        resolve(accessToken);
      } catch (err) {
        this.isRefreshing = false;
        reject(err);
      } finally {
        this.refreshPromise = null;
      }
    });

    return this.refreshPromise;
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
      const { providerId, status, minPrice, maxPrice, category, year, ...rest } = filters as any;
      // Known mappings for API
      if (category) params.append('category', String(category));
      if (year != null) params.append('year', String(year));
      if (providerId) params.append('artisanId', String(providerId));
      if (minPrice != null) params.append('minBudget', String(minPrice));
      if (maxPrice != null) params.append('maxBudget', String(maxPrice));
      if (status) params.append('statuses', String(status));
      // Pass-through for any additional supported filters
      Object.entries(rest).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const url = params.toString() ? `/projects?${params.toString()}` : '/projects';
    const response: AxiosResponse<any> = await this.api.get(url);
    // Accept either array or { data: [...] }
    const data = Array.isArray(response.data) ? response.data : (response.data?.projects || response.data?.data || []);
    return data as Service[];
  }

  async getServiceById(id: string): Promise<Service> {
    const response: AxiosResponse<Service> = await this.api.get(`/projects/${id}`);
    return response.data;
  }

  async getServicesByProvider(providerId: string): Promise<Service[]> {
    const response: AxiosResponse<any> = await this.api.get(`/projects`, {
      params: { artisanId: providerId },
    });
    const data = Array.isArray(response.data) ? response.data : (response.data?.projects || response.data?.data || []);
    return data as Service[];
  }

  // Providers
  async getProviders(): Promise<Provider[]> {
    try {
      const response: AxiosResponse<any> = await this.api.get('/artisans', {
        params: { status: 'ACTIVE', limit: 100, offset: 0 },
      });
      const raw = response.data?.data || response.data || [];
      const providers: Provider[] = (raw as any[]).map((a: any) => ({
        id: a.id,
        name: a.user?.fullName || a.businessName || a.user?.email || 'Artisan',
        email: a.user?.email || '',
        phone: a.user?.phone || '',
        services: [],
        totalServices: a.stats?.projects || 0,
        totalRevenue: a.stats?.revenue || 0,
        rating: a.rating || 0,
        createdAt: a.createdAt || new Date().toISOString(),
      }));
      return providers;
    } catch (err) {
      // Graceful fallback to avoid crashing UI when providers endpoint fails
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-console
        console.warn('getProviders failed, returning empty list');
      }
      return [];
    }
  }

  // Categories (minimal for search filter)
  async getCategories(): Promise<Array<{ id: string; name: string }>> {
    try {
      const res: AxiosResponse<any> = await this.api.get('/categories', {
        params: { limit: 100, offset: 0 },
      });
      const raw = res.data?.data || res.data || [];
      return (raw as any[]).map((c: any) => ({ id: c.id, name: c.name }));
    } catch (err) {
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-console
        console.warn('getCategories failed, returning empty list');
      }
      return [];
    }
  }

  async getProviderById(id: string): Promise<Provider> {
    const response: AxiosResponse<any> = await this.api.get(`/artisans/${id}`);
    const a = response.data;
    const provider: Provider = {
      id: a.id,
      name: a.user?.fullName || a.businessName || a.user?.email || 'Artisan',
      email: a.user?.email || '',
      phone: a.user?.phone || '',
      services: [],
      totalServices: a.stats?.projects || 0,
      totalRevenue: a.stats?.revenue || 0,
      rating: a.rating || 0,
      createdAt: a.createdAt || new Date().toISOString(),
    };
    return provider;
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    // Try primary endpoint first
    try {
      const response: AxiosResponse<any> = await this.api.get('/dashboard/stats/global');
      const data = response.data || {};
      return {
        totalProjects: data.totalProjects ?? 0,
        totalRevenue: data.totalRevenue ?? 0,
        totalArtisans: data.totalArtisans ?? 0,
        totalAnnouncements: data.totalAnnouncements ?? 0,
        projectsThisMonth: data.projectsThisMonth ?? 0,
        revenueThisMonth: data.revenueThisMonth ?? 0,
        topCategories: (data.topCategories || []).map((c: any) => ({
          name: c.name,
          count: c.count,
          revenue: c.revenue,
        })),
        monthlyStats: (data.monthlyStats || []).map((m: any) => ({
          month: m.month,
          projects: m.projects,
          revenue: m.revenue,
        })),
      } as DashboardStats;
    } catch (_) {
      // Fallback: try to compose from projects/transactions stats
      try {
        const [projectsStatsRes, transactionsStatsRes] = await Promise.all([
          this.api.get('/projects/stats/global'),
          this.api.get('/transactions/stats').catch(() => ({ data: {} })),
        ]);

        const ps: any = projectsStatsRes.data || {};
        const ts: any = transactionsStatsRes.data || {};

        const totalProjects = ps.totalProjects || ps.total || ps.count || 0;
        const totalArtisans = ps.totalArtisans || ps.artisans?.total || 0;
        const projectsThisMonth = ps.projectsThisMonth || ps.monthly?.at?.(-1)?.projects || 0;
        const totalRevenue = ts.totalRevenue || ts.revenue?.total || 0;
        const revenueThisMonth = ts.revenueThisMonth || ts.revenue?.thisMonth || 0;

        const topCategories = (ps.topCategories || ps.categories || []).map((c: any) => ({
          name: c.name || c.category || 'Inconnu',
          count: c.count || c.total || 0,
          revenue: c.revenue || 0,
        }));

        const monthlyStats = (ps.monthlyStats || ps.monthly || []).map((m: any) => ({
          month: m.month || m.label || '',
          projects: m.projects || m.count || 0,
          revenue: m.revenue || 0,
        }));

        return {
          totalProjects,
          totalRevenue,
          totalArtisans,
          totalAnnouncements: 0,
          projectsThisMonth,
          revenueThisMonth,
          topCategories,
          monthlyStats,
        } as DashboardStats;
      } catch (err) {
        // Last resort: return empty structure
        return {
          totalProjects: 0,
          totalRevenue: 0,
          totalArtisans: 0,
          totalAnnouncements: 0,
          projectsThisMonth: 0,
          revenueThisMonth: 0,
          topCategories: [],
          monthlyStats: [],
        };
      }
    }
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
      const { providerId, status, minPrice, maxPrice, category, year, ...rest } = filters as any;
      if (category) params.append('category', String(category));
      if (year != null) params.append('year', String(year));
      if (providerId) params.append('artisanId', String(providerId));
      if (minPrice != null) params.append('minBudget', String(minPrice));
      if (maxPrice != null) params.append('maxBudget', String(maxPrice));
      if (status) params.append('statuses', String(status));
      Object.entries(rest).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const response: AxiosResponse<any> = await this.api.get(`/projects?${params.toString()}`);
    const data = Array.isArray(response.data) ? response.data : (response.data?.projects || response.data?.data || []);
    return data as Service[];
  }

  // Statistiques
  async getServicesByYear(year: number): Promise<Service[]> {
    const response: AxiosResponse<any> = await this.api.get(`/projects`, { params: { year, limit: 1000, page: 1 } });
    const data = Array.isArray(response.data) ? response.data : (response.data?.projects || response.data?.data || []);
    return data as Service[];
  }

  async getServicesByCategory(category: string): Promise<Service[]> {
    const response: AxiosResponse<any> = await this.api.get(`/projects`, { params: { category } });
    const data = Array.isArray(response.data) ? response.data : (response.data?.projects || response.data?.data || []);
    return data as Service[];
  }

  // ============ Méthodes pour les Archives ============
  // Note: Ces endpoints peuvent ne pas exister dans l'API actuelle
  // Utilisation des endpoints existants comme fallback

  /**
   * Obtenir les statistiques par année (utilise les projets existants)
   */
  async getLibraryYears(): Promise<any[]> {
    try {
      // Essayer d'abord l'endpoint spécifique aux archives
      const response: AxiosResponse<any[]> = await this.api.get('/library/years');
      return response.data;
    } catch (error) {
      // Fallback: utiliser les projets pour générer les années
      console.warn('Endpoint /library/years non disponible, utilisation du fallback (archives)');
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
      console.warn(`Endpoint /library/years/${year}/categories non disponible, utilisation du fallback (archives)`);
      try {
        const projects = await this.getServicesByYear(year);
        // S'assurer que projects est un tableau
        const projectsArray = Array.isArray(projects) ? projects : [];
        
        // Filtrer manuellement par année au cas où l'API ne le fait pas correctement
        const projectsOfYear = projectsArray.filter((project: Service) => {
          const projectYear = new Date(project.createdAt).getFullYear();
          return projectYear === year;
        });
        
        const categoryMap = new Map();
        
        projectsOfYear.forEach((project: Service) => {
          // Utiliser la catégorie de l'annonce associée
          const categoryData = (project as any).announcement?.category;
          const categoryName = categoryData?.name || 'Non catégorisé';
          const categoryLogo = categoryData?.logo || null;
          const budget = (project as any).announcement?.budget || 0;
          
          if (!categoryMap.has(categoryName)) {
            categoryMap.set(categoryName, { 
              name: categoryName, 
              count: 0, 
              revenue: 0, 
              logo: categoryLogo 
            });
          }
          const current = categoryMap.get(categoryName);
          categoryMap.set(categoryName, { 
            name: categoryName, 
            count: current.count + 1,
            revenue: current.revenue + budget,
            logo: categoryLogo
          });
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
      console.warn('Endpoint library/projects non disponible, utilisation du fallback (archives)');
      try {
        // Récupérer les projets de l'année puis filtrer par catégorie
        let projects = await this.getServicesByYear(year);
        
        // S'assurer que projects est un tableau
        const projectsArray = Array.isArray(projects) ? projects : [];
        
        // Filtrer par catégorie en utilisant announcement.category.name
        let filteredProjects = projectsArray.filter(p => {
          const projectCategory = (p as any).announcement?.category?.name;
          return projectCategory === category;
        });
        
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
   * Obtenir les statistiques globales des archives
   */
  async getLibraryStats(): Promise<any> {
    try {
      const response: AxiosResponse<any> = await this.api.get('/library/stats');
      return response.data;
    } catch (error) {
      // Fallback: utiliser les stats du dashboard
      console.warn('Endpoint /library/stats non disponible, utilisation du fallback dashboard (archives)');
      return await this.getDashboardStats();
    }
  }
}

export const apiService = new ApiService();
export default apiService;
