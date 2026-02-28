import { useState, useEffect, useCallback } from 'react';

interface UseApiResult<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

/**
 * Custom hook for fetching API data with loading/error states and abort cleanup.
 */
export function useApi<T>(fetcher: () => Promise<T>): UseApiResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [trigger, setTrigger] = useState(0);

    const refetch = useCallback(() => {
        setTrigger((n) => n + 1);
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        let cancelled = false;

        setLoading(true);
        setError(null);

        fetcher()
            .then((result) => {
                if (!cancelled) {
                    setData(result);
                    setLoading(false);
                }
            })
            .catch((err: Error) => {
                if (!cancelled && err.name !== 'AbortError') {
                    setError(err.message);
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [fetcher, trigger]);

    return { data, loading, error, refetch };
}
