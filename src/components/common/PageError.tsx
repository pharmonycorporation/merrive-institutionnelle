'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

export default function PageError({
  title = 'Une erreur est survenue',
  message = 'Veuillez réessayer. Si le problème persiste, contactez le support.',
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="p-6">
      <div className="border rounded-lg p-6 bg-white">
        <div className="flex items-start">
          <div className="p-2 mr-3 rounded-full bg-yellow-100">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">{title}</h2>
            <p className="text-sm text-gray-600 mb-4">{message}</p>
            {onRetry && (
              <Button variant="outline" onClick={onRetry}>Réessayer</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

