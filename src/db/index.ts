/**
 * Database module public API.
 * Re-exports connection functions and type definitions.
 */

export { createDatabase, initializeSchema, getDatabase } from './connection.js';
export type { Agent, Task, TaskComment, ContextEntry } from './types.js';
