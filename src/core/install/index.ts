/**
 * Multi-client installation system.
 *
 * Barrel export for the install module — provides client detection,
 * adapter management, and template loading.
 */

// Types
export type {
    ClientType,
    ClientConfig,
    ClientAdapter,
    GenerateResult,
    CleanResult,
    DetectionResult,
} from './types.js';

// Detection
export { detectClients, detectClient } from './detect.js';

// Registry
export { registerAdapter, getAdapter, getAllAdapters } from './registry.js';

// Template
export { getTemplatePath, loadCanonicalTemplate } from './template.js';
