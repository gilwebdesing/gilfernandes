/**
 * Dynamic Script Loader for Third-Party Services (GA4, Cloudflare, etc.)
 * Delays loading until user interaction or timeout to improve TBT and LCP.
 */

let scriptsLoaded = false;

const loadScript = (src, id, async = true, defer = true) => {
  if (document.getElementById(id)) return;
  
  const script = document.createElement('script');
  script.src = src;
  script.id = id;
  script.async = async;
  script.defer = defer;
  document.head.appendChild(script);
};

const initGA4 = () => {
  // Prevent duplicate init
  if (window.gtagInitialized) return;
  
  window.dataLayer = window.dataLayer || [];
  function gtag(){window.dataLayer.push(arguments);}
  window.gtag = gtag;
  
  gtag('js', new Date());
  gtag('config', 'G-7H7JW6QF5H', {
    'send_page_view': true,
    'anonymize_ip': true
  });
  
  window.gtagInitialized = true;
};

export const loadThirdPartyScripts = () => {
  if (scriptsLoaded) return;
  scriptsLoaded = true;

  // Google Analytics 4
  loadScript('https://www.googletagmanager.com/gtag/js?id=G-7H7JW6QF5H', 'ga4-script');
  initGA4();

  // Cloudflare Beacon (Example URL, replace with actual if needed)
  // loadScript('https://static.cloudflareinsights.com/beacon.min.js', 'cloudflare-beacon');
  
  // Tidio Chat is handled by its own component, but could be moved here if centralized control is needed.
  console.log('[ScriptLoader] Third-party scripts loaded.');
};

export const setupScriptLoader = () => {
  if (typeof window === 'undefined') return;

  const handleInteraction = () => {
    loadThirdPartyScripts();
    cleanup();
  };

  const cleanup = () => {
    window.removeEventListener('scroll', handleInteraction);
    window.removeEventListener('click', handleInteraction);
    window.removeEventListener('touchstart', handleInteraction);
    window.removeEventListener('mousemove', handleInteraction);
  };

  // Load on interaction
  window.addEventListener('scroll', handleInteraction, { passive: true });
  window.addEventListener('click', handleInteraction, { passive: true });
  window.addEventListener('touchstart', handleInteraction, { passive: true });
  window.addEventListener('mousemove', handleInteraction, { passive: true });

  // Fallback timeout (3-5 seconds)
  setTimeout(() => {
    if (!scriptsLoaded) {
      loadThirdPartyScripts();
      cleanup();
    }
  }, 4000);
};