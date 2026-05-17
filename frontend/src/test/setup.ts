import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// jsdom does not implement scrollIntoView (used by the console auto-scroll).
Element.prototype.scrollIntoView = vi.fn();
