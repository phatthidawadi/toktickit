import { getPrisma } from "../src/prisma.js";
import bcrypt from "bcryptjs";

export async function seedDatabase() {
  const prisma = getPrisma();
  const defaultPasswordHash = "$2b$10$PthZkzqA7W9qhEloVjE3n.H/DGBCcw.Ip5GbH4ijbbyHpVKuOp/Hm";

  // 1. Seed Categories
  const categoryData = [
    { name: "Account and Access", description: "Login, password, and permission requests" },
    { name: "Hardware", description: "Laptop, monitor, printer, and peripheral issues" },
    { name: "Software", description: "Application crashes, installation, and license issues" },
    { name: "Network", description: "Wi-Fi, VPN, and connectivity problems" },
  ];

  const categoryMap = new Map<string, number>();

  for (const cat of categoryData) {
    const record = await prisma.category.upsert({
      where: { name: cat.name },
      update: { description: cat.description, isActive: true },
      create: { name: cat.name, description: cat.description, isActive: true },
    });
    categoryMap.set(cat.name, record.id);
  }
  console.log("Categories seeded successfully.");

  // 2. Seed Related Systems
  const relatedSystemData = [
    { name: "Email", categoryName: "Account and Access", description: "Corporate email and webmail access" },
    { name: "Corporate Laptop", categoryName: "Hardware", description: "Issued laptop hardware and battery" },
    { name: "Printer", categoryName: "Hardware", description: "Office and network printers" },
    { name: "LEB2 App", categoryName: "Software", description: "Learning management application" },
    { name: "Grade Submission App", categoryName: "Software", description: "Academic grading platform" },
    { name: "Campus Wi-Fi", categoryName: "Network", description: "On-campus wireless network" },
    { name: "VPN Service", categoryName: "Network", description: "Secure remote network access" },
  ];

  const systemMap = new Map<string, number>();

  for (const sys of relatedSystemData) {
    const categoryId = categoryMap.get(sys.categoryName);
    if (!categoryId) continue;

    const existing = await prisma.relatedSystem.findFirst({
      where: { name: sys.name, categoryId },
    });

    if (existing) {
      const record = await prisma.relatedSystem.update({
        where: { id: existing.id },
        data: { description: sys.description, isActive: true },
      });
      systemMap.set(sys.name, record.id);
    } else {
      const record = await prisma.relatedSystem.create({
        data: {
          name: sys.name,
          description: sys.description,
          categoryId,
          isActive: true,
        },
      });
      systemMap.set(sys.name, record.id);
    }
  }
  console.log("Related Systems seeded successfully.");

  // 3. Seed Users (Requesters, IT Staff, Administrators)
  const userData = [
    // Requesters (4 Active, 1 Inactive)
    { name: "Jennifer Anderson", email: "jennifer.a@example.com", role: "REQUESTER" as const, isActive: true },
    { name: "Michael Brown", email: "michael.b@example.com", role: "REQUESTER" as const, isActive: true },
    { name: "Sarah Johnson", email: "sarah.j@example.com", role: "REQUESTER" as const, isActive: true },
    { name: "David Lee", email: "david.l@example.com", role: "REQUESTER" as const, isActive: true },
    { name: "Alex Taylor", email: "alex.t@example.com", role: "REQUESTER" as const, isActive: false },
    // IT Staff (3 Active, 1 Inactive)
    { name: "Staff Somchai", email: "staff.somchai@example.com", role: "IT_STAFF" as const, isActive: true },
    { name: "Staff Somsri", email: "staff.somsri@example.com", role: "IT_STAFF" as const, isActive: true },
    { name: "Staff Wichai", email: "staff.wichai@example.com", role: "IT_STAFF" as const, isActive: true },
    { name: "Staff Inactive", email: "staff.inactive@example.com", role: "IT_STAFF" as const, isActive: false },
    // Administrator (1 Active)
    { name: "Admin TokTickIT", email: "admin.toktickit@example.com", role: "ADMINISTRATOR" as const, isActive: true },
  ];

  const userMap = new Map<string, number>();

  for (const user of userData) {
    const normalizedEmail = user.email.trim().toLowerCase();
    const record = await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: {
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        passwordHash: defaultPasswordHash,
        mustChangePassword: true,
      },
      create: {
        name: user.name,
        email: normalizedEmail,
        passwordHash: defaultPasswordHash,
        role: user.role,
        isActive: user.isActive,
        mustChangePassword: true,
      },
    });
    userMap.set(normalizedEmail, record.id);
  }
  console.log("Users seeded successfully.");

  // 4. Seed Initial Sample Tickets
  const reqId = userMap.get("jennifer.a@example.com")!;
  const staffId = userMap.get("staff.somchai@example.com")!;
  const catId = categoryMap.get("Account and Access")!;
  const sysId = systemMap.get("Email")!;

  const ticketData = {
    summary: "Cannot access corporate email account",
    description: "Encountering invalid credentials error when signing into Outlook web portal.",
    requestedPriority: "HIGH" as const,
    itPriority: "HIGH" as const,
    currentStatus: "IN_PROGRESS" as const,
    requesterId: reqId,
    assignedStaffId: staffId,
    categoryId: catId,
    relatedSystemId: sysId,
  };

  const ticket = await prisma.ticket.upsert({
    where: { ticketNumber: "TKT-2026-000001" },
    update: ticketData,
    create: {
      ticketNumber: "TKT-2026-000001",
      ...ticketData,
    },
  });

  const existingComment = await prisma.ticketComment.findFirst({ where: { ticketId: ticket.id } });
  if (!existingComment) {
    await prisma.ticketComment.create({
      data: {
        ticketId: ticket.id,
        authorId: reqId,
        content: "Please look into this urgently as I need access for morning meetings.",
      },
    });
  }

  const existingNote = await prisma.ticketInternalNote.findFirst({ where: { ticketId: ticket.id } });
  if (!existingNote) {
    await prisma.ticketInternalNote.create({
      data: {
        ticketId: ticket.id,
        authorId: staffId,
        content: "Verified account status in Active Directory. Resetting password token.",
      },
    });
  }
  console.log("Sample ticket and notes seeded.");
}

if (process.argv[1]?.includes("seed")) {
  seedDatabase()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await getPrisma().$disconnect();
    });
}
