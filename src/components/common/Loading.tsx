'use client';

import React from 'react';

export default function Loading({ label = 'Chargement...' }: { label?: string }) {
  return (
    <div className="w-full min-h-[8rem] flex items-center justify-center text-sm text-gray-600">
      <div className="flex items-center space-x-3">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent" />
        <span>{label}</span>
      </div>
    </div>
  );
}

