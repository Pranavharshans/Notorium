'use client';

import React, { Component, ReactNode } from 'react';
import { ErrorResponse, ErrorCode, ErrorMessages } from '@/lib/errors/subscription-errors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: ErrorResponse;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  static getDerivedStateFromError(error: any): State {
    let errorResponse: ErrorResponse;

    if (error.code && error.message) {
      errorResponse = error as ErrorResponse;
    } else {
      errorResponse = {
        code: 'UNKNOWN_ERROR' as ErrorCode,
        message: error.message || ErrorMessages.UNKNOWN_ERROR
      };
    }

    return {
      hasError: true,
      error: errorResponse
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 rounded-md bg-red-50 border border-red-200">
          <div className="flex items-center mb-2">
            <svg
              className="w-5 h-5 text-red-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-red-800">
              Something went wrong
            </h3>
          </div>
          
          <p className="text-sm text-red-600 mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="text-sm px-4 py-2 rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;