/**
 * Database module public API.
 * Re-exports connection functions and type definitions.
 */

export { createDatabase, initializeSchema, getDatabase, runMigrations } from './connection.js';
export type { Agent, Bug, ContextEntry, Milestone, Phase, Plan, WorkflowState } from './types.js';

