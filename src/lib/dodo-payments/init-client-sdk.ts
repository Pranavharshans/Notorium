'use client';
/// <reference types="../../types/dodo-sdk.d.ts" />

// Initialize Dodo client-side SDK
const initDodoSDK = () => {
  // Prevent adding the script multiple times
  if (document.getElementById('dodo-sdk-script')) {
    console.log('Dodo SDK script already added.');
    return;
  }

  const script = document.createElement('script');
  script.id = 'dodo-sdk-script'; // Add an ID to check if it exists
  script.src = 'https://js-dev.dodo.dev/v1'; // Verify this URL if issues persist
  script.async = true;
  
  script.onload = () => {
    // When the script loads, initialize the SDK
    if (window.dodo) { 
      try {
        window.dodo.initializePayments({
          environment: process.env.NODE_ENV === 'development' ? 'test' : 'live'
        });
        console.log('Dodo Payments client SDK initialized successfully.');
      } catch (initError) {
        console.error('Error initializing Dodo Payments SDK:', initError);
      }
    } else {
      console.error('Dodo Payments SDK loaded but window.dodo is not defined.');
    }
  };

  script.onerror = (event: Event | string) => {
    // Log more details about the error event
    console.error('Error loading Dodo Payments SDK script:', event);
    if (event instanceof Event) {
      console.error('Error event details:', { type: event.type, target: event.target });
    }
  };

  document.head.appendChild(script);
};

export default initDodoSDK;