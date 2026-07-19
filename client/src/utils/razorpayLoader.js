let loadPromise = null;

/**
 * Injects https://checkout.razorpay.com/v1/checkout.js once and
 * resolves when window.Razorpay is available. Called right before
 * opening the checkout widget — no need to load it on every page,
 * only when someone actually reaches checkout.
 */
export function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  return loadPromise;
}
