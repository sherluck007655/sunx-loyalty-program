import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

export const useApi = (apiFunction, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    immediate = true,
    onSuccess,
    onError,
    showErrorToast = true,
    showSuccessToast = false
  } = options;

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiFunction(...args);
      
      setData(response.data || response);
      
      if (onSuccess) {
        onSuccess(response.data || response);
      }
      
      if (showSuccessToast && response.message) {
        toast.success(response.message);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
      
      if (showErrorToast) {
        toast.error(errorMessage);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError, showErrorToast, showSuccessToast]);

  useEffect(() => {
    if (immediate && apiFunction) {
      execute();
    }
  }, dependencies);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  return {
    data,
    loading,
    error,
    execute,
    refetch
  };
};
