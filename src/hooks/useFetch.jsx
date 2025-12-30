import { useEffect, useState } from 'react';

function useFetchData(fetchFunction) {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [isSuccess, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      setLoading(true);
      try {
        const resp = await fetchFunction();

        const isApiError =
          resp &&
          typeof resp === 'object' &&
          resp.success === false &&
          !Array.isArray(resp);

        if (isApiError) {
          if (isMounted) {
            setError(resp);
            setData(null);
            setSuccess(false);
          }
          return;
        }

        const normalized = Array.isArray(resp)
          ? resp
          : resp && (resp.result !== undefined ? resp.result : (resp.data !== undefined ? resp.data : resp));

        if (isMounted) {
          setData(normalized);
          setSuccess(true);
        }
      } catch (error) {
        if (isMounted) setError(error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, isLoading, isSuccess, error };
}

export default function useFetch(fetchFunction) {
  const { data, isLoading, isSuccess, error } = useFetchData(fetchFunction);

  return { result: data, isLoading, isSuccess, error };
}
