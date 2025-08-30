'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';

type Props = {
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
};

type State = { hasError: boolean };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[12rem] p-6 flex flex-col items-center justify-center text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            {this.props.fallbackTitle || 'Une erreur est survenue'}
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            {this.props.fallbackMessage || 'Veuillez réessayer. Si le problème persiste, contactez le support.'}
          </p>
          <Button onClick={this.handleReset} variant="outline">Réessayer</Button>
        </div>
      );
    }
    return this.props.children;
  }
}

