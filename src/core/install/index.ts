/**
 * Multi-client installation system.
 *
 * Barrel export for the install module — provides client detection,
 * adapter management, template loading, and adapter registration.
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

// Adapters — side-effect imports to trigger self-registration
import './adapters/antigravity.js';
import './adapters/claude-code.js';
import './adapters/cursor.js';
import './adapters/codex.js';
import './adapters/opencode.js';
import './adapters/gemini-cli.js';
