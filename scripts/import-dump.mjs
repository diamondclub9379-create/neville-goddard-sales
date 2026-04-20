// One-shot: import a MySQL/TiDB dump via mysql2 (handles TiDB TLS out-of-the-box).
// Usage: node scripts/import-dump.mjs <path-to-dump.sql> [DATABASE_URL]

import { createConnection } from "mysql2/promise";
import { readFileSync } from "node:fs";
import { argv, env, exit } from "node:process";

const dumpPath = argv[2];
const url = argv[3] ?? env.DATABASE_URL;

if (!dumpPath || !url) {
  console.error("Usage: node scripts/import-dump.mjs <path-to-dump.sql> [DATABASE_URL]");
  exit(1);
}

const sql = readFileSync(dumpPath, "utf-8");

// Split into individual statements. A dump is safe to split on `;\n` at end of line
// because we don't have user-supplied data with embedded newlines in statements.
// Preserve LOCK TABLES / UNLOCK TABLES as their own statements.
const statements = sql
  .split(/;\s*\n/)
  .map((s) => s.trim())
  .filter((s) => s.length > 0 && !s.startsWith("--") && !s.match(/^\s*\/\*!.*\*\/\s*$/));

console.log(`Parsed ${statements.length} statements from ${dumpPath}`);

const conn = await createConnection({
  uri: url,
  multipleStatements: false,
  ssl: { rejectUnauthorized: true },
});

console.log("Connected to database");

let ok = 0;
let skipped = 0;
let failed = 0;

for (const stmt of statements) {
  // Skip directives like /*!40101 SET ... */
  if (stmt.startsWith("/*!") && stmt.endsWith("*/")) {
    skipped++;
    continue;
  }
  try {
    await conn.query(stmt);
    ok++;
    if (ok % 20 === 0) process.stdout.write(`  ${ok} statements ok\r`);
  } catch (err) {
    // Ignore errors from commented-out directives, continue on "table already exists" only if we're doing a clean import
    console.error(`\n[FAIL] ${stmt.slice(0, 120)}...`);
    console.error(`       ${err.message}`);
    failed++;
    if (failed > 5) {
      console.error("Too many failures, aborting");
      exit(2);
    }
  }
}

console.log(`\nDone: ${ok} ok, ${skipped} skipped, ${failed} failed`);

const [[counts]] = await conn.query(`
  SELECT
    (SELECT COUNT(*) FROM products) AS products,
    (SELECT COUNT(*) FROM blogPosts) AS blogs,
    (SELECT COUNT(*) FROM bookReviews) AS reviews,
    (SELECT COUNT(*) FROM orders) AS orders
`);
console.log("Row counts:", counts);

await conn.end();
