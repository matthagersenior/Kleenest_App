// Compatibility entry only. The production runtime is booted from main.jsx -> CanonicalAppRuntime.jsx.
// Keep the historical module path import-safe while preventing a second runtime implementation.
export { default } from './CanonicalAppRuntime.jsx';
