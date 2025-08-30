'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  User, 
  FileText,
  Eye,
  Download,
  X
} from 'lucide-react';
import { Service, SearchFilters } from '@/types';
import apiService from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import ProjectMedia from '@/components/media-viewer/ProjectMedia';

interface SearchFormData {
  query: string;
  category: string;
  providerId: string;
  status: string;
  year: string;
  minPrice: string;
  maxPrice: string;
}

export default function SearchPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [providers, setProviders] = useState<any[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [providersError, setProvidersError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Service | null>(null);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<SearchFormData>();

  const watchedQuery = watch('query');

  const fetchProviders = async () => {
    setProvidersLoading(true);
    setProvidersError(null);
    try {
      const data = await apiService.getProviders();
      setProviders(data);
    } catch (error: any) {
      console.error('Erreur lors du chargement des prestataires:', error);
      setProvidersError('Erreur de chargement des prestataires');
      showToast({ type: 'error', message: 'Erreur de chargement des prestataires.' });
    } finally {
      setProvidersLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
    // load categories as well
    (async () => {
      setCategoriesLoading(true);
      setCategoriesError(null);
      try {
        const list = await apiService.getCategories();
        setCategories(list);
      } catch (e: any) {
        console.error('Erreur lors du chargement des catégories:', e);
        setCategoriesError('Erreur de chargement des catégories');
        showToast({ type: 'error', message: 'Erreur de chargement des catégories.' });
      } finally {
        setCategoriesLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: SearchFormData) => {
    setLoading(true);
    try {
      const filters: SearchFilters = {};
      
      if (data.category) filters.category = data.category;
      if (data.providerId) filters.providerId = data.providerId;
      if (data.status) filters.status = data.status;
      if (data.year) filters.year = parseInt(data.year);
      if (data.minPrice) filters.minPrice = parseFloat(data.minPrice);
      if (data.maxPrice) filters.maxPrice = parseFloat(data.maxPrice);

      let results: Service[];
      if (data.query) {
        results = await apiService.searchServices(data.query, filters);
      } else {
        results = await apiService.getServices(filters);
      }
      
      setServices(results);
    } catch (error: any) {
      console.error('Erreur lors de la recherche:', error);
      showToast({ type: 'error', message: 'Erreur lors de la recherche.' });
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    reset();
    setServices([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'En cours';
      case 'completed':
        return 'Terminé';
      case 'cancelled':
        return 'Annulé';
      case 'draft':
        return 'Brouillon';
      case 'on_hold':
        return 'En pause';
      default:
        return status;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Recherche de Services</h1>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2"
        >
          <Filter className="h-4 w-4" />
          <span>Filtres</span>
        </Button>
      </div>

      {/* Formulaire de recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Recherche</CardTitle>
          <CardDescription>
            Recherchez des services par mot-clé, catégorie, prestataire ou autres critères
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recherche
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    {...register('query')}
                    placeholder="Rechercher par titre, description..."
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Catégorie
                  </label>
                  <div className="flex items-center space-x-2">
                    {categoriesLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                    ) : (
                      <span className="text-xs text-gray-500">{categories.length} catégorie(s)</span>
                    )}
                    <button
                      type="button"
                      onClick={async () => {
                        setCategoriesLoading(true);
                        setCategoriesError(null);
                        try {
                          const list = await apiService.getCategories();
                          setCategories(list);
                        } catch (e: any) {
                          console.error('Erreur lors du chargement des catégories:', e);
                          setCategoriesError('Erreur de chargement des catégories');
                          showToast({ type: 'error', message: 'Erreur de chargement des catégories.' });
                        } finally {
                          setCategoriesLoading(false);
                        }
                      }}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Rafraîchir
                    </button>
                  </div>
                </div>
                <select
                  {...register('category')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                {!categoriesLoading && categories.length === 0 && (
                  <p className="mt-1 text-xs text-gray-500">Aucune catégorie disponible.</p>
                )}
                {categoriesError && (
                  <p className="mt-1 text-xs text-red-600">{categoriesError}</p>
                )}
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Prestataire
                    </label>
                    <div className="flex items-center space-x-2">
                      {providersLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                      ) : (
                        <span className="text-xs text-gray-500">{providers.length} trouvé(s)</span>
                      )}
                      <button
                        type="button"
                        onClick={fetchProviders}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Rafraîchir
                      </button>
                    </div>
                  </div>
                  <select
                    {...register('providerId')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tous les prestataires</option>
                    {providers.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                  {!providersLoading && providers.length === 0 && (
                    <p className="mt-1 text-xs text-gray-500">Aucun prestataire disponible.</p>
                  )}
                  {providersError && (
                    <p className="mt-1 text-xs text-red-600">{providersError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <select
                    {...register('status')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="draft">Brouillon</option>
                    <option value="in_progress">En cours</option>
                    <option value="on_hold">En pause</option>
                    <option value="completed">Terminé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Année
                  </label>
                  <select
                    {...register('year')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Toutes les années</option>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix minimum (FCFA)
                  </label>
                  <Input
                    {...register('minPrice')}
                    type="number"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix maximum (FCFA)
                  </label>
                  <Input
                    {...register('maxPrice')}
                    type="number"
                    placeholder="100000"
                  />
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <Button type="submit" disabled={loading} className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <span>{loading ? 'Recherche...' : 'Rechercher'}</span>
              </Button>
              <Button type="button" variant="outline" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Effacer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Résultats */}
      {services.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Résultats ({services.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                      <p className="text-gray-600 mt-1">{service.description}</p>
                      
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{service.artisan?.fullName || service.providerName || 'Non assigné'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText className="h-4 w-4" />
                          <span>{service.tags?.join(', ') || service.category || 'Non catégorisé'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{(service.budget || service.price || 0).toLocaleString()} FCFA</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(service.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mt-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                          {getStatusLabel(service.status)}
                        </span>
                        {(service.files?.length || service.media?.length || 0) > 0 && (
                          <span className="text-xs text-gray-500">
                            {(service.files?.length || service.media?.length || 0)} fichier(s) attaché(s)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                      {((service.files?.length || service.media?.length || 0) > 0) && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedProject(service)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Médias
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {services.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun service trouvé</p>
            <p className="text-sm text-gray-400 mt-1">
              Essayez de modifier vos critères de recherche
            </p>
          </CardContent>
        </Card>
      )}

      {/* Project Media Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Médias - {selectedProject.name}</h3>
              <Button variant="outline" size="sm" onClick={() => setSelectedProject(null)}>
                Fermer
              </Button>
            </div>
            <div className="p-4 max-h-96 overflow-auto">
              <ProjectMedia 
                projectId={selectedProject.id} 
                projectName={selectedProject.name} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
