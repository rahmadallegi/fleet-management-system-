import { useState, useEffect, useCallback } from 'react';

// Generic hook for API calls
export const useApi = (apiFunction, dependencies = [], options = {}) => {
  const [data, setData] = useState(options.initialData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { immediate = true, onSuccess, onError } = options;

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunction(...args);
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      setError(err);
      onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError]);

  useEffect(() => { if (immediate) execute(); }, dependencies);
  const reset = useCallback(() => {
    setData(options.initialData || null);
    setError(null);
    setLoading(false);
  }, [options.initialData]);

  return { data, loading, error, execute, reset, refetch: execute };
};

// Paginated API hook
export const usePaginatedApi = (apiFunction, initialParams = {}) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 0, totalItems: 0, hasNextPage: false, hasPrevPage: false, limit: 10 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchData = useCallback(async (newParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const mergedParams = { ...params, ...newParams };
      const result = await apiFunction(mergedParams);
      if (result.data) {
        setData(result.data[Object.keys(result.data)[0]] || []);
        setPagination(result.data.pagination || {});
      }
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally { setLoading(false); }
  }, [apiFunction, params]);

  const updateParams = useCallback(newParams => setParams(prev => ({ ...prev, ...newParams })), []);
  const nextPage = useCallback(() => { if (pagination.hasNextPage) fetchData({ page: pagination.currentPage + 1 }); }, [fetchData, pagination]);
  const prevPage = useCallback(() => { if (pagination.hasPrevPage) fetchData({ page: pagination.currentPage - 1 }); }, [fetchData, pagination]);
  const goToPage = useCallback(page => fetchData({ page }), [fetchData]);

  useEffect(() => { fetchData(); }, []);

  return { data, pagination, loading, error, fetchData, updateParams, nextPage, prevPage, goToPage, refetch: () => fetchData(params) };
};

// Hook for form submission
export const useApiSubmit = (apiFunction, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { onSuccess, onError, resetOnSuccess = true } = options;

  const submit = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const result = await apiFunction(data);
      setSuccess(true);
      onSuccess?.(result);
      if (resetOnSuccess) setTimeout(() => setSuccess(false), 3000);
      return result;
    } catch (err) {
      setError(err);
      onError?.(err);
      throw err;
    } finally { setLoading(false); }
  }, [apiFunction, onSuccess, onError, resetOnSuccess]);

  const reset = useCallback(() => { setError(null); setSuccess(false); setLoading(false); }, []);

  return { submit, loading, error, success, reset };
};

export default useApi;
