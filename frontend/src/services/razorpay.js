let razorpayScriptPromise;

export function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true);

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        razorpayScriptPromise = undefined;
        reject(new Error('Unable to load Razorpay Checkout. Check your connection and try again.'));
      };
      document.body.appendChild(script);
    });
  }

  return razorpayScriptPromise;
}
