'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  X, 
  Download, 
  FileText, 
  Image, 
  Video, 
  Music, 
  File,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw
} from 'lucide-react';

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

interface MediaViewerProps {
  files: MediaFile[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export default function MediaViewer({ files, isOpen, onClose, initialIndex = 0 }: MediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!isOpen || files.length === 0) return null;

  const currentFile = files[currentIndex];
  const isImage = currentFile.fileType === 'image';
  const isVideo = currentFile.fileType === 'video';
  const isAudio = currentFile.fileType === 'audio';
  const isDocument = currentFile.fileType === 'document';

  const nextFile = () => {
    setCurrentIndex((prev) => (prev + 1) % files.length);
    setZoom(1);
    setRotation(0);
  };

  const prevFile = () => {
    setCurrentIndex((prev) => (prev - 1 + files.length) % files.length);
    setZoom(1);
    setRotation(0);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image': return <Image className="h-8 w-8" />;
      case 'video': return <Video className="h-8 w-8" />;
      case 'audio': return <Music className="h-8 w-8" />;
      case 'document': return <FileText className="h-8 w-8" />;
      default: return <File className="h-8 w-8" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            {getFileIcon(currentFile.fileType)}
            <div>
              <h3 className="font-semibold text-lg">{currentFile.originalName}</h3>
              <p className="text-sm text-gray-500">
                {formatFileSize(currentFile.fileSize)} • {currentFile.mimeType}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isImage && (
              <>
                <Button variant="outline" size="sm" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleRotate}>
                  <RotateCw className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" onClick={() => window.open(currentFile.fileUrl, '_blank')}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="relative h-full flex items-center justify-center bg-gray-100">
            {/* Navigation buttons */}
            {files.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevFile}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextFile}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* File content */}
            <div className="max-w-full max-h-full overflow-auto p-4">
              {isImage && (
                <img
                  src={currentFile.fileUrl}
                  alt={currentFile.originalName}
                  className="max-w-full max-h-full object-contain"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transition: 'transform 0.2s ease-in-out'
                  }}
                />
              )}

              {isVideo && (
                <video
                  controls
                  className="max-w-full max-h-full"
                  src={currentFile.fileUrl}
                >
                  Votre navigateur ne supporte pas la lecture de vidéos.
                </video>
              )}

              {isAudio && (
                <div className="text-center">
                  <Music className="h-24 w-24 mx-auto mb-4 text-gray-400" />
                  <audio controls className="w-full max-w-md">
                    <source src={currentFile.fileUrl} type={currentFile.mimeType} />
                    Votre navigateur ne supporte pas la lecture audio.
                  </audio>
                </div>
              )}

              {isDocument && (
                <div className="text-center">
                  <FileText className="h-24 w-24 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-4">Document: {currentFile.originalName}</p>
                  <Button onClick={() => window.open(currentFile.fileUrl, '_blank')}>
                    Ouvrir le document
                  </Button>
                </div>
              )}

              {!isImage && !isVideo && !isAudio && !isDocument && (
                <div className="text-center">
                  <File className="h-24 w-24 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-4">Type de fichier non supporté</p>
                  <Button onClick={() => window.open(currentFile.fileUrl, '_blank')}>
                    Télécharger le fichier
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {currentIndex + 1} sur {files.length}
            </p>
            {currentFile.description && (
              <p className="text-sm text-gray-600 max-w-md truncate">
                {currentFile.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
