import fs from "fs";
import path from "path";
import postgres from "postgres";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function runSeeds() {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.DATABASE_URI ||
    "postgresql://postgres:postgres@localhost:5432/postgres";

  console.log("🌱 Starting database seeding...");
  const sql = postgres(connectionString, { prepare: false });

  try {
    const seedsDir = path.join(process.cwd(), "database", "seeds");
    if (!fs.existsSync(seedsDir)) {
      console.error(`❌ Seeds directory not found: ${seedsDir}`);
      process.exit(1);
    }

    const files = fs
      .readdirSync(seedsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of files) {
      console.log(`⏳ Executing seed file: ${file}...`);
      const filePath = path.join(seedsDir, file);
      const sqlContent = fs.readFileSync(filePath, "utf-8");

      await sql.unsafe(sqlContent);
      console.log(`✅ Seeded successfully: ${file}`);
    }

    console.log("🎉 All seeds applied successfully!");
  } catch (err) {
    console.error("❌ Seeding failed with error:", err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runSeeds();
