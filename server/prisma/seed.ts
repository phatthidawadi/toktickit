import { getPrisma } from "../src/prisma.js";

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

  // 3. Seed Development Requesters (4 Active, 1 Inactive)
  const requesterData = [
    { name: "Jennifer Anderson", email: "jennifer.a@example.com", department: "Human Resources", isActive: true },
    { name: "Michael Brown", email: "michael.b@example.com", department: "Finance", isActive: true },
    { name: "Sarah Johnson", email: "sarah.j@example.com", department: "Marketing", isActive: true },
    { name: "David Lee", email: "david.l@example.com", department: "Engineering", isActive: true },
    { name: "Alex Taylor", email: "alex.t@example.com", department: "Operations", isActive: false },
  ];

  for (const req of requesterData) {
    await prisma.requesterUser.upsert({
      where: { email: req.email },
      update: { name: req.name, department: req.department, isActive: req.isActive },
      create: { name: req.name, email: req.email, department: req.department, isActive: req.isActive },
    });
  }
  console.log("Development Requesters seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });
