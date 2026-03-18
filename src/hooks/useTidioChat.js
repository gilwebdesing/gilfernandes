import { useState, useEffect, useCallback } from 'react';

export function useTidioChat() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    console.log('[TidioHook] Initializing hook...');

    // Check if Tidio is already available globally
    if (window.tidioChatApi) {
      console.log('[TidioHook] window.tidioChatApi found immediately');
      setIsLoaded(true);
    }

    const checkInterval = setInterval(() => {
      if (window.tidioChatApi) {
        console.log('[TidioHook] window.tidioChatApi detected via interval');
        setIsLoaded(true);
        clearInterval(checkInterval);
      }
    }, 1000);

    // Listen for the custom event dispatched by TidioScript
    const handleScriptLoaded = () => {
      console.log('[TidioHook] Received tidioScriptLoaded event');
      // Give it a moment to initialize the API object
      setTimeout(() => {
        if (window.tidioChatApi) {
          console.log('[TidioHook] API ready after script load event');
          setIsLoaded(true);
        }
      }, 500);
    };

    window.addEventListener('tidioScriptLoaded', handleScriptLoaded);

    return () => {
      clearInterval(checkInterval);
      window.removeEventListener('tidioScriptLoaded', handleScriptLoaded);
    };
  }, []);

  const setPropertyContext = useCallback((propertyData) => {
    console.log('[TidioHook] setPropertyContext called with raw data:', propertyData);

    if (!propertyData) {
      console.warn('[TidioHook] No property data provided to context setter');
      return;
    }

    const { id, title, price, neighborhood } = propertyData;
    let attempt = 0;
    const maxAttempts = 10;

    const trySetData = () => {
      if (window.tidioChatApi) {
        // Prepare the payload strictly
        const payload = {
          current_property_id: id || '',
          current_property_title: title || '',
          current_property_price: price ? String(price) : '',
          current_property_neighborhood: neighborhood || '',
          last_viewed_url: window.location.href,
          last_updated_at: new Date().toISOString()
        };

        console.log('[TidioHook] 🟢 Calling window.tidioChatApi.setVisitorData with payload:', payload);

        try {
          // Tidio allows setting custom visitor properties (Variables)
          window.tidioChatApi.setVisitorData(payload);
          console.log('[TidioHook] ✅ Success: Data sent to Tidio API');
        } catch (err) {
          console.error('[TidioHook] 🔴 Error calling setVisitorData:', err);
        }
      } else if (attempt < maxAttempts) {
        attempt++;
        console.log(`[TidioHook] API not ready, retrying (attempt ${attempt}/${maxAttempts})...`);
        
        // Exponential backoff: 1s, 1.5s, 2.25s, etc.
        const delay = Math.min(1000 * Math.pow(1.5, attempt), 10000);
        setTimeout(trySetData, delay);
      } else {
        console.error('[TidioHook] ❌ Failed to set context: Tidio API never became available');
      }
    };

    trySetData();
  }, []);

  return { isLoaded, setPropertyContext };
}