// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: "postgresql://neondb_owner:npg_8dPAzWCakI5c@ep-dry-salad-adgk5r4a-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require",
  },
  verbose: true,
  strict: true,
});