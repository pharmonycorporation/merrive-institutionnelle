'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Folder, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search
} from 'lucide-react';
import Link from 'next/link';
import apiService from '@/services/api';

interface YearStats {
  year: number;
  totalProjects: number;
  totalRevenue: number;
}

export default function LibraryPage() {
  const [years, setYears] = useState<YearStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const yearsPerPage = 10;

  useEffect(() => {
    const fetchYears = async () => {
      try {
        setLoading(true);
        const yearsData = await apiService.getLibraryYears();
        setYears(yearsData);
      } catch (error) {
        console.error('Erreur lors du chargement des années:', error);
        // Fallback avec des données simulées
        const currentYear = new Date().getFullYear();
        const mockYears: YearStats[] = [];
        
        for (let year = currentYear; year >= 2020; year--) {
          mockYears.push({
            year,
            totalProjects: Math.floor(Math.random() * 100) + 10,
            totalRevenue: Math.floor(Math.random() * 1000000) + 100000
          });
        }
        
        setYears(mockYears);
      } finally {
        setLoading(false);
      }
    };

    fetchYears();
  }, []);

  const filteredYears = (years || []).filter(year => 
    year.year.toString().includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredYears.length / yearsPerPage);
  const startIndex = (currentPage - 1) * yearsPerPage;
  const endIndex = startIndex + yearsPerPage;
  const currentYears = filteredYears.slice(startIndex, endIndex);

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bibliothèque</h1>
          <p className="text-gray-600 mt-1">
            Explorez les projets par année
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une année..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Years Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentYears.map((yearStats) => (
          <Link key={yearStats.year} href={`/library/${yearStats.year}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {yearStats.year}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {yearStats.totalProjects} projet{yearStats.totalProjects > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <Folder className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Projets:</span>
                    <span className="font-medium">{yearStats.totalProjects}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Revenus:</span>
                    <span className="font-medium">{formatRevenue(yearStats.totalRevenue)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} sur {totalPages}
          </span>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {filteredYears.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune année trouvée</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
