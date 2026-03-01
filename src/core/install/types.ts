/**
 * Types and interfaces for the multi-client installation system.
 *
 * Defines the adapter pattern used by per-client config generators
 * (Antigravity, Claude Code, Cursor, Codex, OpenCode).
 */

/** Supported AI coding client types. */
export type ClientType =
    | 'antigravity'
    | 'claude-code'
    | 'cursor'
    | 'codex'
    | 'opencode'
    | 'gemini-cli';

/** Metadata describing a client's configuration format. */
export interface ClientConfig {
    type: ClientType;
    /** Human-readable display name (e.g. "Claude Code"). */
    name: string;
    /** Relative paths the client uses for its config files. */
    configPaths: string[];
    /** Config format descriptor (e.g. "markdown+yaml-frontmatter"). */
    configFormat: string;
}

/** Result of generating config files for a client. */
export interface GenerateResult {
    /** Absolute paths of files that were created/updated. */
    files: string[];
    /** Non-fatal warnings encountered during generation. */
    warnings: string[];
}

/** Result of cleaning (removing) generated config files. */
export interface CleanResult {
    /** Absolute paths of files that were removed. */
    removed: string[];
    /** Paths that were skipped (e.g. user-modified files). */
    skipped: string[];
}

/** Result of detecting a client's presence in a project. */
export interface DetectionResult {
    client: ClientType;
    confidence: 'high' | 'medium' | 'low';
    /** Human-readable reason for the detection (e.g. "Found .cursor/ directory"). */
    reason: string;
}

/**
 * Adapter interface that each per-client config generator must implement.
 *
 * Adapters are registered via the adapter registry and invoked by the
 * `pm install <client>` command.
 */
export interface ClientAdapter {
    /** Check whether this client is present in the project. */
    detect(projectRoot: string): boolean;
    /** Generate native config files from the canonical template. */
    generate(projectRoot: string, templatePath: string): GenerateResult;
    /** Remove previously generated config files. */
    clean(projectRoot: string): CleanResult;
    /** Return metadata about this client's configuration. */
    getConfig(): ClientConfig;
}
