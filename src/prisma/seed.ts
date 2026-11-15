import { db } from "./db.ts";

export const initialTasks = [
  // ── Figma Screen 2 & 4 Tasks ───────────────────────────────────────────────
  {
    title: "Finishing Wireframe",
    description: "Finalize mobile wireframes and UI components for the to-do list app",
    dateTime: new Date("2026-11-15T09:00:00.000Z"),
    endTime: new Date("2026-11-15T11:30:00.000Z"),
    priority: "High",
    status: "In Progress",
  },
  {
    title: "Meeting with team",
    description: "Daily standup and sprint planning review with the frontend team",
    dateTime: new Date("2026-11-15T11:45:00.000Z"),
    endTime: new Date("2026-11-15T12:30:00.000Z"),
    priority: "Medium",
    status: "In Progress",
  },
  {
    title: "Buy a cat food",
    description: "Pick up salmon flavor wet cat food from the pet store",
    dateTime: new Date("2026-11-15T15:00:00.000Z"),
    endTime: new Date("2026-11-15T16:00:00.000Z"),
    priority: "Low",
    status: "Completed",
  },
  {
    title: "Finishing daily commission",
    description: "Complete design client revision requests and export assets",
    dateTime: new Date("2026-11-15T16:30:00.000Z"),
    endTime: new Date("2026-11-15T18:00:00.000Z"),
    priority: "Medium",
    status: "Completed",
  },

  // ── Figma Screen 3 Task ───────────────────────────────────────────────────
  {
    title: "Doing Homework",
    description: "Physics chapters 4 & 5 practice exercises and calculus set",
    dateTime: new Date("2026-11-16T14:00:00.000Z"),
    endTime: new Date("2026-11-16T16:00:00.000Z"),
    priority: "High",
    status: "In Progress",
  },

  // ── Weekly Card Summary Tasks (Current & Adjacent Weeks) ───────────────────
  {
    title: "Design System Architecture",
    description: "Prepare architectural diagrams and database schema for the To-Do app",
    dateTime: new Date("2026-11-10T10:00:00.000Z"),
    endTime: new Date("2026-11-10T12:00:00.000Z"),
    priority: "High",
    status: "Completed",
  },
  {
    title: "Setup Next.js & Tailwind CSS",
    description: "Initialize the repository with Next.js App Router and configure Tailwind",
    dateTime: new Date("2026-11-11T14:30:00.000Z"),
    endTime: new Date("2026-11-11T16:00:00.000Z"),
    priority: "Medium",
    status: "Completed",
  },
  {
    title: "Implement PostgreSQL Database with Docker",
    description: "Spin up postgres container and configure environment credentials",
    dateTime: new Date("2026-11-13T16:00:00.000Z"),
    endTime: new Date("2026-11-13T17:30:00.000Z"),
    priority: "High",
    status: "Completed",
  },
  {
    title: "Implement Search and Filter UI",
    description: "Interactive keyword search and live weekly card updates",
    dateTime: new Date("2026-11-18T15:00:00.000Z"),
    endTime: new Date("2026-11-18T17:00:00.000Z"),
    priority: "Low",
    status: "In Progress",
  },
  {
    title: "Deploy Full Application to Netlify",
    description: "Configure Netlify build settings and connect live production database",
    dateTime: new Date("2026-11-20T17:00:00.000Z"),
    endTime: new Date("2026-11-20T18:30:00.000Z"),
    priority: "High",
    status: "In Progress",
  },
];

let pendingSeed: Promise<void> | undefined;

export async function runSeed(force = false): Promise<void> {
  const existing = await db.orm.public.Task.select("id").limit(1).all();
  if (existing.length > 0 && !force) {
    return;
  }

  // If force seeding, delete existing rows first
  if (force && existing.length > 0) {
    const allRows = await db.orm.public.Task.select("id").all();
    for (const r of allRows) {
      await db.orm.public.Task.where({ id: r.id }).delete();
    }
  }

  for (const task of initialTasks) {
    await db.orm.public.Task.create(task);
  }
}

export function seed(): Promise<void> {
  pendingSeed ??= runSeed(false).catch((error: unknown) => {
    pendingSeed = undefined;
    throw error;
  });
  return pendingSeed;
}

// Allow direct execution via CLI: `npm run seed`
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("🌱 Running database seed...");
  runSeed(true)
    .then(() => {
      console.log(`✅ Database successfully seeded with ${initialTasks.length} tasks!`);
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Seed failed:", err);
      process.exit(1);
    });
}
