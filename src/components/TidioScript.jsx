import React, { useEffect, useRef } from 'react';

const TidioScript = () => {
  const scriptLoaded = useRef(false);

  useEffect(() => {
    // Prevent double loading
    if (scriptLoaded.current || document.getElementById('tidio-chat-script')) {
      return;
    }

    scriptLoaded.current = true;
    
    const script = document.createElement('script');
    script.src = '//code.tidio.co/bolac4y8gyjbhzyvsdu8wxpld9hzlaog.js';
    script.id = 'tidio-chat-script';
    script.async = true;

    script.onload = () => {
      // Dispatch a custom event so the hook knows it's ready
      window.dispatchEvent(new Event('tidioScriptLoaded'));
    };

    document.body.appendChild(script);

    // Cleanup not typically needed for global chat widgets as they persist across navigation
    // but we ensure we don't duplicate on re-mounts via the ID check above.
  }, []);

  return null;
};

export default TidioScript;