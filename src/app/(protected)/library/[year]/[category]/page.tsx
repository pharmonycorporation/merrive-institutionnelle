'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  ArrowLeft,
  Search,
  User,
  Calendar,
  DollarSign,
  FileText,
  Eye,
  Download,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Service } from '@/types';
import apiService from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import ProjectMedia from '@/components/media-viewer/ProjectMedia';

export default function CategoryProjectsPage() {
  const params = useParams();
  const year = parseInt(params.year as string);
  const category = decodeURIComponent(params.category as string);
  
  const [projects, setProjects] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Service | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const projectsData = await apiService.getLibraryCategoryProjects(year, category, 1, 50);
        setProjects(projectsData.projects);
      } catch (error: any) {
        console.error('Erreur lors du chargement des projets:', error);
        // Fallback avec des données simulées
        showToast({ type: 'info', message: 'Fallback archives: projets simulés.' });
        const mockProjects: Service[] = Array.from({ length: 15 }, (_, i) => ({
          id: `project-${i}`,
          name: `Projet ${category} ${i + 1}`,
          description: `Description du projet ${i + 1} dans la catégorie ${category}`,
          status: ['draft', 'in_progress', 'completed', 'cancelled'][Math.floor(Math.random() * 4)] as any,
          budget: Math.floor(Math.random() * 100000) + 10000,
          createdAt: new Date(year, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
          updatedAt: new Date().toISOString(),
          tags: [category],
          artisan: {
            id: `artisan-${i}`,
            fullName: `Artisan ${i + 1}`,
            email: `artisan${i + 1}@example.com`
          },
          client: {
            id: `client-${i}`,
            fullName: `Client ${i + 1}`,
            email: `client${i + 1}@example.com`
          },
          files: Array.from({ length: Math.floor(Math.random() * 5) }, (_, j) => ({
            id: `file-${i}-${j}`,
            fileName: `fichier-${j + 1}.pdf`,
            originalName: `Fichier ${j + 1}`,
            fileUrl: `https://example.com/file-${j + 1}.pdf`,
            fileSize: Math.floor(Math.random() * 1000000) + 10000,
            mimeType: 'application/pdf',
            fileType: 'document' as any
          }))
        }));
        setProjects(mockProjects);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [year, category]);

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.artisan?.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'in_progress': return 'En cours';
      case 'draft': return 'Brouillon';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const formatRevenue = (revenue: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(revenue);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/library/${year}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {category} - {year}
            </h1>
            <p className="text-gray-600 mt-1">
              {filteredProjects.length} projet{filteredProjects.length > 1 ? 's' : ''} trouvé{filteredProjects.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher dans les projets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filtres</span>
              </Button>
              
              <div className="text-sm text-gray-500">
                {filteredProjects.length} résultat{filteredProjects.length > 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{project.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{project.artisan?.fullName || 'Non assigné'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(project.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatRevenue(project.budget || 0)}</span>
                    </div>
                    {(project.files?.length || 0) > 0 && (
                      <div className="flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>{project.files?.length || 0} fichier{(project.files?.length || 0) > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedProject(project)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Voir
                  </Button>
                  {(project.files?.length || 0) > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProject(project)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Médias
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun projet trouvé</p>
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
