'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Music, 
  File,
  Eye,
  Download,
  FolderOpen
} from 'lucide-react';
import MediaViewer from './MediaViewer';
import apiService from '@/services/api';

interface ProjectMediaProps {
  projectId: string;
  projectName: string;
}

interface MediaFile {
  id: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  fileType: 'document' | 'image' | 'video' | 'audio' | 'other';
  description?: string;
}

export default function ProjectMedia({ projectId, projectName }: ProjectMediaProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        const projectFiles = await apiService.getServiceMedia(projectId);
        setFiles(projectFiles);
      } catch (error) {
        console.error('Erreur lors du chargement des fichiers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [projectId]);

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image': return <ImageIcon className="h-6 w-6 text-blue-500" />;
      case 'video': return <Video className="h-6 w-6 text-red-500" />;
      case 'audio': return <Music className="h-6 w-6 text-green-500" />;
      case 'document': return <FileText className="h-6 w-6 text-orange-500" />;
      default: return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const openViewer = (index: number) => {
    setSelectedFileIndex(index);
    setViewerOpen(true);
  };

  const groupFilesByType = () => {
    const groups = {
      images: files.filter(f => f.fileType === 'image'),
      videos: files.filter(f => f.fileType === 'video'),
      documents: files.filter(f => f.fileType === 'document'),
      audio: files.filter(f => f.fileType === 'audio'),
      other: files.filter(f => !['image', 'video', 'document', 'audio'].includes(f.fileType))
    };
    return groups;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FolderOpen className="h-5 w-5" />
            <span>Médias du projet</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (files.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FolderOpen className="h-5 w-5" />
            <span>Médias du projet</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun fichier attaché à ce projet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const fileGroups = groupFilesByType();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FolderOpen className="h-5 w-5" />
            <span>Médias du projet ({files.length} fichier{files.length > 1 ? 's' : ''})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Images */}
            {fileGroups.images.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                  <ImageIcon className="h-4 w-4 text-blue-500" />
                  <span>Images ({fileGroups.images.length})</span>
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {fileGroups.images.map((file, index) => (
                    <div
                      key={file.id}
                      className="relative group cursor-pointer rounded-lg overflow-hidden border hover:shadow-md transition-shadow"
                      onClick={() => openViewer(files.findIndex(f => f.id === file.id))}
                    >
                      <img
                        src={file.fileUrl}
                        alt={file.originalName}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                        <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="p-2 bg-white">
                        <p className="text-xs text-gray-600 truncate">{file.originalName}</p>
                        <p className="text-xs text-gray-400">{formatFileSize(file.fileSize)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Autres fichiers */}
            {Object.entries(fileGroups).map(([type, typeFiles]) => {
              if (type === 'images' || typeFiles.length === 0) return null;
              
              const typeLabels = {
                videos: 'Vidéos',
                documents: 'Documents',
                audio: 'Audio',
                other: 'Autres fichiers'
              };

              return (
                <div key={type}>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                    {getFileIcon(typeFiles[0]?.fileType || 'other')}
                    <span>{typeLabels[type as keyof typeof typeLabels]} ({typeFiles.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {typeFiles.map((file, index) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          {getFileIcon(file.fileType)}
                          <div>
                            <p className="font-medium text-sm">{file.originalName}</p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.fileSize)} • {file.mimeType}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openViewer(files.findIndex(f => f.id === file.id))}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Voir
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(file.fileUrl, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Télécharger
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <MediaViewer
        files={files}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        initialIndex={selectedFileIndex}
      />
    </>
  );
}
