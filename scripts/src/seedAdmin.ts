import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = "admin@mqayada.sa";
const ADMIN_PASSWORD = "Admin@1234";

async function seedAdmin() {
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, ADMIN_EMAIL));
  if (existing.length > 0) {
    console.log("✅ Admin already exists:", ADMIN_EMAIL);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const [admin] = await db
    .insert(usersTable)
    .values({ name: "مدير المنصة", email: ADMIN_EMAIL, passwordHash, role: "admin" })
    .returning();

  console.log("✅ Admin created:", admin.email, "| Password:", ADMIN_PASSWORD);
  process.exit(0);
}

seedAdmin().catch((e) => { console.error(e); process.exit(1); });
