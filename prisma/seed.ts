/**
 * Database seed — creates the initial admin user and app settings.
 * Run with: npm run db:seed
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Admin accounts from env
  const adminEmails = (process.env.ADMIN_EMAILS ?? "sales@orengen.io").split(",");

  for (const email of adminEmails) {
    const trimmed = email.trim();
    if (!trimmed) continue;

    const existing = await prisma.user.findUnique({ where: { email: trimmed } });
    if (existing) {
      if (existing.role !== "ADMIN") {
        await prisma.user.update({ where: { email: trimmed }, data: { role: "ADMIN" } });
        console.log(`✅ Upgraded ${trimmed} to ADMIN`);
      } else {
        console.log(`ℹ️  Admin ${trimmed} already exists`);
      }
      continue;
    }

    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD ?? "ChangeMe2026!";
    const passwordHash = await bcrypt.hash(defaultPassword, 12);

    await prisma.user.create({
      data: {
        email: trimmed,
        name: "Admin",
        passwordHash,
        role: "ADMIN",
      },
    });
    console.log(`✅ Created admin: ${trimmed} (password: ${defaultPassword})`);
  }

  // App settings defaults
  const settings = [
    { key: "affiliate_program_active", value: "true" },
    { key: "partner_program_active", value: "true" },
    { key: "payout_minimum_usd", value: "25" },
    { key: "cookie_attribution_days", value: "90" },
    { key: "clawback_window_days", value: "30" },
    { key: "fast_start_window_days", value: "14" },
    { key: "fast_start_bonus_usd", value: "50" },
    { key: "product_setup_fee_usd", value: "997" },
    { key: "product_monthly_usd", value: "247" },
  ];

  for (const s of settings) {
    await prisma.appSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }

  console.log("✅ App settings initialized");
  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
