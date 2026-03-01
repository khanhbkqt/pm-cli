export function handleCommandError(error: unknown): void {
    if (error instanceof Error) {
        console.error(`Error: ${error.message}`);

        // SQLite datatype mismatch often means stale schema (e.g. string UUIDs inserted into old integer ID columns)
        if (error.message.includes('datatype mismatch') || error.message.includes('SQLITE_MISMATCH')) {
            console.error('\nHint: Your database schema may be out of date. Run: pm init to migrate.');
        }
    } else {
        console.error('An unexpected error occurred');
    }
    process.exit(1);
}
