'use client';

import React, { useEffect } from 'react';
import PageError from '@/components/common/PageError';

export default function ProtectedError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Protected segment error:', error);
  }, [error]);

  return (
    <PageError
      title="Oups, quelque chose s'est mal passé"
      message="Une erreur est survenue lors du chargement de cette page. Vous pouvez réessayer."
      onRetry={reset}
    />
  );
}
