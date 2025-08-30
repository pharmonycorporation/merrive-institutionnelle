'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Folder, 
  ArrowLeft,
  Search,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Palette,
  Code,
  Camera
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import apiService from '@/services/api';
import { useToast } from '@/contexts/ToastContext';

interface CategoryStats {
  name: string;
  count: number;
  revenue: number;
  logo: string | null;
}

export default function YearCategoriesPage() {
  const params = useParams();
  const year = parseInt(params.year as string);
  
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await apiService.getLibraryYearCategories(year);
        setCategories(categoriesData);
      } catch (error: any) {
        console.error('Erreur lors du chargement des catégories:', error);
        // Fallback avec des données simulées
        showToast({ type: 'info', message: 'Fallback archives: catégories simulées.' });
        const mockCategories: CategoryStats[] = [
          { name: 'Art', count: 45, revenue: 250000, icon: 'palette' },
          { name: 'Musique', count: 32, revenue: 180000, icon: 'music' },
          { name: 'Littérature', count: 28, revenue: 120000, icon: 'file-text' },
          { name: 'Photographie', count: 56, revenue: 320000, icon: 'camera' },
          { name: 'Vidéo', count: 23, revenue: 150000, icon: 'video' },
          { name: 'Design', count: 38, revenue: 200000, icon: 'code' },
          { name: 'Architecture', count: 15, revenue: 80000, icon: 'folder' },
          { name: 'Mode', count: 42, revenue: 280000, icon: 'image' },
        ];
        
        setCategories(mockCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [year, showToast]);

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'palette': return <Palette className="h-6 w-6" />;
      case 'music': return <Music className="h-6 w-6" />;
      case 'file-text': return <FileText className="h-6 w-6" />;
      case 'camera': return <Camera className="h-6 w-6" />;
      case 'video': return <Video className="h-6 w-6" />;
      case 'code': return <Code className="h-6 w-6" />;
      case 'image': return <ImageIcon className="h-6 w-6" />;
      default: return <Folder className="h-6 w-6" />;
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
          <Link href="/library">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Archives {year}
            </h1>
            <p className="text-gray-600 mt-1">
              Catégories de projets pour l'année {year}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une catégorie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCategories.map((category) => (
          <Link key={category.name} href={`/library/${year}/${encodeURIComponent(category.name)}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      {getCategoryIcon(category.icon)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {category.count} projet{category.count > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <Folder className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Projets:</span>
                    <span className="font-medium">{category.count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Revenus:</span>
                    <span className="font-medium">{formatRevenue(category.revenue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Moyenne:</span>
                    <span className="font-medium">
                      {formatRevenue(category.count > 0 ? category.revenue / category.count : 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune catégorie trouvée</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
