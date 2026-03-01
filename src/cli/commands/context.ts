import { Command } from "commander";
import {
  setContext,
  getContext,
  listContext,
  searchContext,
} from "../../core/context.js";
import { resolveIdentity, getProjectDb } from "../../core/identity.js";
import { formatContext, formatContextList } from "../../output/formatter.js";

/**
 * Register all context management commands under `pm context`.
 */
export function registerContextCommands(program: Command): void {
  const context = program
    .command("context")
    .description("Manage shared context");

  // pm context set <key> <value>
  context
    .command("set <key> <value>")
    .description("Set a context entry (requires agent identity)")
    .option(
      "--category <category>",
      "Category: decision, spec, note, constraint",
      "note",
    )
    .action(async (key: string, value: string, opts: { category: string }) => {
      try {
        const db = getProjectDb();
        const me = resolveIdentity(db, { agent: program.opts().agent });
        const entry = setContext(db, {
          key,
          value,
          category: opts.category,
          created_by: me.id,
        });
        const json = program.opts().json;

        if (json) {
          console.log(JSON.stringify(entry, null, 2));
        } else {
          console.log(`✓ Context '${entry.key}' set.`);
        }
        db.close();
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes("CHECK constraint failed")) {
            console.error(
              `Error: Invalid category. Must be one of: 'decision', 'spec', 'note', 'constraint'`,
            );
          } else {
            console.error(`Error: ${error.message}`);
          }
        } else {
          console.error("An unexpected error occurred");
        }
        process.exit(1);
      }
    });

  // pm context get <key>
  context
    .command("get <key>")
    .description("Get a context entry by key")
    .action(async (key: string) => {
      try {
        const db = getProjectDb();
        const json = program.opts().json;
        const entry = getContext(db, key);

        if (!entry) {
          console.error(`Context key '${key}' not found.`);
          process.exit(1);
        }

        console.log(formatContext(entry, json));
        db.close();
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
        } else {
          console.error("An unexpected error occurred");
        }
        process.exit(1);
      }
    });

  // pm context list
  context
    .command("list")
    .description("List all context entries")
    .option("--category <category>", "Filter by category")
    .action(async (opts: { category?: string }) => {
      try {
        const db = getProjectDb();
        const json = program.opts().json;
        const entries = listContext(db, { category: opts.category });
        console.log(formatContextList(entries, json));
        db.close();
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
        } else {
          console.error("An unexpected error occurred");
        }
        process.exit(1);
      }
    });

  // pm context search <query>
  context
    .command("search <query>")
    .description("Search context entries by key or value")
    .action(async (query: string) => {
      try {
        const db = getProjectDb();
        const json = program.opts().json;
        const entries = searchContext(db, query);
        console.log(formatContextList(entries, json));
        db.close();
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
        } else {
          console.error("An unexpected error occurred");
        }
        process.exit(1);
      }
    });
}
