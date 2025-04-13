import { useState, useCallback } from 'react';
import { ErrorResponse, handleApiError } from '@/lib/errors/subscription-errors';

interface ApiRequestState<T> {
  data: T | null;
  error: ErrorResponse | null;
  loading: boolean;
}

interface UseApiRequestOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ErrorResponse) => void;
}

export function useApiRequest<T, Args extends unknown[] = unknown[]>(
  requestFn: (...args: Args) => Promise<T>,
  options: UseApiRequestOptions<T> = {}
) {
  const [state, setState] = useState<ApiRequestState<T>>({
    data: null,
    error: null,
    loading: false
  });

  const execute = useCallback(
    async (...args: Args) => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const response = await requestFn(...args);
        setState({ data: response, error: null, loading: false });
        options.onSuccess?.(response);
        return response;
      } catch (error) {
        const errorResponse = handleApiError(error);
        setState({ data: null, error: errorResponse, loading: false });
        options.onError?.(errorResponse);
        throw errorResponse;
      }
    },
    [requestFn, options]
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, loading: false });
  }, []);

  return {
    ...state,
    execute,
    reset
  };
}

// Helper hook for subscription-related requests
export function useSubscriptionRequest<T, Args extends unknown[] = unknown[]>(
  requestFn: (...args: Args) => Promise<T>,
  options: UseApiRequestOptions<T> = {}
) {
  const {
    data,
    error,
    loading,
    execute,
    reset
  } = useApiRequest<T, Args>(requestFn, {
    ...options,
    onError: (error) => {
      // Add subscription-specific error handling
      if (error.code === 'USAGE_LIMIT_EXCEEDED') {
        // Could show upgrade prompt or specific message
      }
      options.onError?.(error);
    }
  });

  return {
    data,
    error,
    loading,
    execute,
    reset,
    // Helper method for checking if error is usage related
    isUsageLimitError: error?.code === 'USAGE_LIMIT_EXCEEDED'
  };
}

// Example usage:
/*
const MyComponent = () => {
  const { data, error, loading, execute } = useSubscriptionRequest<{ success: boolean }, [string]>(
    async (userId: string) => {
      const response = await fetch(`/api/subscription/upgrade?userId=${userId}`);
      if (!response.ok) throw await response.json();
      return response.json();
    },
    {
      onSuccess: (data) => {
        console.log('Subscription updated:', data);
      },
      onError: (error) => {
        console.error('Failed to update subscription:', error);
      }
    }
  );

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {data && <div>Success!</div>}
      <button onClick={() => execute('user-123')}>
        Update Subscription
      </button>
    </div>
  );
};
*/