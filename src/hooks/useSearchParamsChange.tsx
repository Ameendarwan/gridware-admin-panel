import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const useSearchParamsChange = () => {
  const location = useLocation();
  const [changeCounter, setChangeCounter] = useState(0);
  const prevSearchRef = useRef<string | null>(null);

  useEffect(() => {
    const currentParams = new URLSearchParams(location.search);

    // Ensure the hook does not trigger unless `page` and `per_page` are present
    const hasRequiredParams = currentParams.get('page') && currentParams.get('per_page');

    if (prevSearchRef.current === null) {
      // Initialize on first render but skip change count unless required params are present
      if (hasRequiredParams) {
        setChangeCounter(prev => prev + 1);
      }
      prevSearchRef.current = location.search;
      return;
    }

    const prevParams = new URLSearchParams(prevSearchRef.current);

    let hasChanged = false;

    // Check if number of parameters changed
    if (currentParams.size === prevParams.size) {
      // Check if any parameter values changed
      for (const [key, value] of currentParams) {
        if (prevParams.get(key) !== value) {
          hasChanged = true;
        }
      }
    } else {
      hasChanged = true;
    }

    if (hasChanged) {
      setChangeCounter(prev => prev + 1);
    }

    prevSearchRef.current = location.search;
  }, [location.search]);

  return changeCounter;
};

export default useSearchParamsChange;
