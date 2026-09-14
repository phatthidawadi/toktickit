import { getPrisma } from "../src/prisma.js";
import bcrypt from "bcryptjs";

async function main() {
  const prisma = getPrisma();

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

  for (const sys of relatedSystemData) {
    const categoryId = categoryMap.get(sys.categoryName);
    if (!categoryId) continue;

    const existing = await prisma.relatedSystem.findFirst({
      where: { name: sys.name, categoryId },
    });

    if (existing) {
      await prisma.relatedSystem.update({
        where: { id: existing.id },
        data: { description: sys.description, isActive: true },
      });
    } else {
      await prisma.relatedSystem.create({
        data: {
          name: sys.name,
          description: sys.description,
          categoryId,
          isActive: true,
        },
      });
    }
  }
  console.log("Related Systems seeded successfully.");

  // Hash initial default password "Password123!" for all seed users
  const defaultPasswordHash = await bcrypt.hash("Password123!", 10);

  // 3. Seed Users per Section 5.3
  // 4 Active Requesters + 1 Inactive Requester
  // 3 Active IT Staff + 1 Inactive IT Staff
  // 1 Active Administrator
  const seedUsers = [
    // Requesters (4 active, 1 inactive)
    {
      name: "Jennifer Anderson",
      email: "jennifer.a@example.com",
      role: "REQUESTER" as const,
      department: "Human Resources",
      isActive: true,
    },
    {
      name: "Michael Brown",
      email: "michael.b@example.com",
      role: "REQUESTER" as const,
      department: "Finance",
      isActive: true,
    },
    {
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      role: "REQUESTER" as const,
      department: "Marketing",
      isActive: true,
    },
    {
      name: "David Lee",
      email: "david.l@example.com",
      role: "REQUESTER" as const,
      department: "Engineering",
      isActive: true,
    },
    {
      name: "Alex Taylor",
      email: "alex.t@example.com",
      role: "REQUESTER" as const,
      department: "Operations",
      isActive: false,
    },

    // IT Staff (3 active, 1 inactive)
    {
      name: "Somchai Staff",
      email: "staff.somchai@example.com",
      role: "IT_STAFF" as const,
      department: "IT Operations",
      isActive: true,
    },
    {
      name: "Somsri Staff",
      email: "staff.somsri@example.com",
      role: "IT_STAFF" as const,
      department: "IT Infrastructure",
      isActive: true,
    },
    {
      name: "Wichai Staff",
      email: "staff.wichai@example.com",
      role: "IT_STAFF" as const,
      department: "IT Helpdesk",
      isActive: true,
    },
    {
      name: "Inactive Staff",
      email: "staff.inactive@example.com",
      role: "IT_STAFF" as const,
      department: "IT Support",
      isActive: false,
    },

    // Administrator (1 active)
    {
      name: "System Administrator",
      email: "admin.toktickit@example.com",
      role: "ADMINISTRATOR" as const,
      department: "IT Management",
      isActive: true,
    },
  ];

  for (const user of seedUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        department: user.department,
        isActive: user.isActive,
      },
      create: {
        name: user.name,
        email: user.email,
        passwordHash: defaultPasswordHash,
        role: user.role,
        department: user.department,
        isActive: user.isActive,
        mustChangePassword: true,
      },
    });
  }
  console.log("Users seeded successfully (5 Requesters, 4 IT Staff, 1 Administrator).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });
