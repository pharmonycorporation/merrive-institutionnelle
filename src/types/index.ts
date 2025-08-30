// Types pour le portail institutionnel MERRIVE

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'institutional' | 'admin';
  organization: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string; // title dans l'API
  description: string;
  category?: string; // tags dans l'API
  providerId?: string; // artisan.id dans l'API
  providerName?: string; // artisan.fullName dans l'API
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  price?: number; // budget dans l'API
  currency?: string;
  createdAt: string;
  updatedAt: string;
  media?: Media[]; // files dans l'API
  // Champs supplémentaires de l'API
  companyName?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  companyAddress?: string;
  budget?: number;
  startDate?: string;
  endDate?: string;
  progress?: number;
  tags?: string[];
  client?: any;
  artisan?: any;
  announcement?: any;
  coverImage?: any;
  files?: any[];
}

export interface Media {
  id: string;
  type: 'image' | 'pdf' | 'video' | 'document';
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  serviceId: string;
  createdAt: string;
}

export interface Provider {
  id: string;
  name: string;
  email: string;
  phone: string;
  services: Service[];
  totalServices: number;
  totalRevenue: number;
  rating: number;
  createdAt: string;
}

export interface SearchFilters {
  category?: string;
  providerId?: string;
  status?: string;
  year?: number;
  dateFrom?: string;
  dateTo?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface DashboardStats {
  totalProjects: number; // totalServices dans l'API
  totalRevenue: number;
  totalArtisans: number; // totalProviders dans l'API
  totalAnnouncements?: number; // ajouté pour dashboard institutionnel
  projectsThisMonth: number; // servicesThisMonth dans l'API
  revenueThisMonth: number;
  topCategories: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
  monthlyStats: Array<{
    month: string;
    projects: number; // services dans l'API
    revenue: number;
  }>;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
