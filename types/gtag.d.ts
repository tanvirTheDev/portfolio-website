// Global type declaration for Google Analytics gtag function
// This prevents TypeScript errors when calling window.gtag(...)

interface Window {
  dataLayer: unknown[];
  gtag: (...args: unknown[]) => void;
}
