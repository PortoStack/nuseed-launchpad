import fs from "fs";
import path from "path";
import postgres from "postgres";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function runMigrations() {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.DATABASE_URI ||
    "postgresql://postgres:postgres@localhost:5432/postgres";

  console.log("🚀 Starting database migrations...");
  console.log(`📡 Connecting to database (prepare: false)...`);

  const sql = postgres(connectionString, { prepare: false });

  try {
    // 1. Create _schema_migrations tracking table
    await sql`
      CREATE TABLE IF NOT EXISTS _schema_migrations (
        name VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 2. Fetch already applied migrations
    const appliedRows = await sql<{ name: string }[]>`
      SELECT name FROM _schema_migrations ORDER BY name ASC;
    `;
    const appliedSet = new Set(appliedRows.map((r) => r.name));

    // 3. Scan migrations directory
    const migrationsDir = path.join(process.cwd(), "database", "migrations");
    if (!fs.existsSync(migrationsDir)) {
      console.error(`❌ Migrations directory not found: ${migrationsDir}`);
      process.exit(1);
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    let count = 0;
    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`⏩ Skipping already applied: ${file}`);
        continue;
      }

      console.log(`⏳ Applying migration: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sqlContent = fs.readFileSync(filePath, "utf-8");

      await sql.begin(async (tx) => {
        await tx.unsafe(sqlContent);
        await tx`
          INSERT INTO _schema_migrations (name) VALUES (${file});
        `;
      });

      console.log(`✅ Applied successfully: ${file}`);
      count++;
    }

    console.log(
      `🎉 All migrations completed! (${count} new migration(s) applied)`
    );
  } catch (err) {
    console.error("❌ Migration failed with error:", err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigrations();
