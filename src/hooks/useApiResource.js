import { useCallback, useEffect, useRef, useState } from 'react';

export default function useApiResource(loader, pickData, fallback = []) {
  const fallbackRef = useRef(fallback);
  const loaderRef = useRef(loader);
  const pickDataRef = useRef(pickData);
  const [data, setData] = useState(fallbackRef.current);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  loaderRef.current = loader;
  pickDataRef.current = pickData;

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await loaderRef.current();
      setData(pickDataRef.current(response));
    } catch (requestError) {
      setError(requestError.message);
      setData(fallbackRef.current);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, setData, loading, error, refresh };
}
