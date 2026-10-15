import { getPrisma } from "../src/prisma.js";

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
    { name: "David Lee", email: "david.l@example.com", role: "REQUESTER" as const, isActive: true }, // Zero-ticket requester
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

  // Helper IDs
  const jenniferId = userMap.get("jennifer.a@example.com")!;
  const michaelId = userMap.get("michael.b@example.com")!;
  const sarahId = userMap.get("sarah.j@example.com")!;
  const somchaiId = userMap.get("staff.somchai@example.com")!;
  const somsriId = userMap.get("staff.somsri@example.com")!;
  const wichaiId = userMap.get("staff.wichai@example.com")!;
  const adminId = userMap.get("admin.toktickit@example.com")!;

  const catAccount = categoryMap.get("Account and Access")!;
  const catHardware = categoryMap.get("Hardware")!;
  const catSoftware = categoryMap.get("Software")!;
  const catNetwork = categoryMap.get("Network")!;

  const sysEmail = systemMap.get("Email")!;
  const sysLaptop = systemMap.get("Corporate Laptop")!;
  const sysPrinter = systemMap.get("Printer")!;
  const sysLEB2 = systemMap.get("LEB2 App")!;
  const sysWifi = systemMap.get("Campus Wi-Fi")!;
  const sysVpn = systemMap.get("VPN Service")!;

  // 4. Seed Diverse Sample Tickets
  const sampleTickets = [
    {
      ticketNumber: "TKT-2026-000001",
      summary: "Cannot access corporate email account",
      description: "Encountering invalid credentials error when signing into Outlook web portal.",
      requestedPriority: "HIGH" as const,
      itPriority: "HIGH" as const,
      currentStatus: "IN_PROGRESS" as const,
      isRequesterResolved: false,
      requesterId: jenniferId,
      assignedStaffId: somchaiId,
      categoryId: catAccount,
      relatedSystemId: sysEmail,
      version: 1,
    },
    {
      ticketNumber: "TKT-2026-000002",
      summary: "VPN connection drops every 10 minutes",
      description: "When working remotely, corporate VPN disconnects frequently requiring re-authentication.",
      requestedPriority: "URGENT" as const,
      itPriority: "URGENT" as const,
      currentStatus: "WAITING_FOR_REQUESTER" as const,
      isRequesterResolved: false,
      requesterId: jenniferId,
      assignedStaffId: somchaiId,
      categoryId: catNetwork,
      relatedSystemId: sysVpn,
      version: 1,
    },
    {
      ticketNumber: "TKT-2026-000003",
      summary: "Printer in Room 302 paper jam and offline",
      description: "Main laser printer gives error code 50.1 and will not print queue documents.",
      requestedPriority: "MEDIUM" as const,
      itPriority: "LOW" as const,
      currentStatus: "NEW" as const,
      isRequesterResolved: false,
      requesterId: michaelId,
      assignedStaffId: null, // Unassigned
      categoryId: catHardware,
      relatedSystemId: sysPrinter,
      version: 1,
    },
    {
      ticketNumber: "TKT-2026-000004",
      summary: "Laptop battery drains within 30 minutes",
      description: "Battery health indicator reports degraded capacity, needs replacement.",
      requestedPriority: "MEDIUM" as const,
      itPriority: "MEDIUM" as const,
      currentStatus: "OPEN" as const,
      isRequesterResolved: false,
      requesterId: sarahId,
      assignedStaffId: null, // Unassigned
      categoryId: catHardware,
      relatedSystemId: sysLaptop,
      version: 1,
    },
    {
      ticketNumber: "TKT-2026-000005",
      summary: "LEB2 course materials upload timeout",
      description: "Faculty portal timeouts when submitting final grade PDFs over 20MB.",
      requestedPriority: "HIGH" as const,
      itPriority: "HIGH" as const,
      currentStatus: "RESOLVED" as const,
      isRequesterResolved: true,
      requesterId: jenniferId,
      assignedStaffId: somsriId,
      categoryId: catSoftware,
      relatedSystemId: sysLEB2,
      version: 2,
    },
    {
      ticketNumber: "TKT-2026-000006",
      summary: "Campus Wi-Fi authentication certificate expired",
      description: "Mobile device rejects Eduroam certificate showing untrusted authority.",
      requestedPriority: "LOW" as const,
      itPriority: "LOW" as const,
      currentStatus: "CLOSED" as const,
      isRequesterResolved: true,
      requesterId: michaelId,
      assignedStaffId: wichaiId,
      categoryId: catNetwork,
      relatedSystemId: sysWifi,
      version: 3,
    },
    {
      ticketNumber: "TKT-2026-000007",
      summary: "Outlook spam filter false positives",
      description: "Legitimate student inquiries routed to junk folder repeatedly.",
      requestedPriority: "LOW" as const,
      itPriority: "LOW" as const,
      currentStatus: "REOPENED" as const,
      isRequesterResolved: false,
      requesterId: sarahId,
      assignedStaffId: somchaiId,
      categoryId: catAccount,
      relatedSystemId: sysEmail,
      version: 2,
    },
    {
      ticketNumber: "TKT-2026-000008",
      summary: "Accidental duplicate ticket submission",
      description: "Submitted in error while testing browser network latency.",
      requestedPriority: "LOW" as const,
      itPriority: "LOW" as const,
      currentStatus: "CANCELLED" as const,
      isRequesterResolved: false,
      requesterId: jenniferId,
      assignedStaffId: null,
      categoryId: catSoftware,
      relatedSystemId: sysLEB2,
      version: 1,
    },
  ];

  const ticketMap = new Map<string, number>();

  for (const t of sampleTickets) {
    const record = await prisma.ticket.upsert({
      where: { ticketNumber: t.ticketNumber },
      update: {
        summary: t.summary,
        description: t.description,
        requestedPriority: t.requestedPriority,
        itPriority: t.itPriority,
        currentStatus: t.currentStatus,
        isRequesterResolved: t.isRequesterResolved,
        assignedStaffId: t.assignedStaffId,
        version: t.version,
      },
      create: t,
    });
    ticketMap.set(t.ticketNumber, record.id);
  }
  console.log("Sample tickets across all 8 statuses seeded.");

  // 5. Seed Actions Taken (Covering 0, 1, and Multiple Actions per Ticket)
  const tkt1Id = ticketMap.get("TKT-2026-000001")!; // Has 2 actions
  const tkt2Id = ticketMap.get("TKT-2026-000002")!; // Has 1 action with follow-up
  const tkt5Id = ticketMap.get("TKT-2026-000005")!; // Has 1 completed action
  // TKT 3, 4, 6, 7, 8 have 0 actions to demonstrate zero-action tickets

  const actionsData = [
    {
      ticketId: tkt1Id,
      description: "Inspected Active Directory user account status and verified MFA device bindings.",
      result: "Account locked out due to 5 bad password attempts. Cleared lockout flag.",
      status: "COMPLETED" as const,
      followUpRequired: false,
      followUpNote: null,
      attachmentNotes: "AD_eventlog_4625.evtx reviewed.",
      performedById: somchaiId,
      assigneeId: somchaiId,
    },
    {
      ticketId: tkt1Id,
      description: "Initiated temporary password reset and sent SMS verification token.",
      result: "User received token and scheduled test sign-in for 14:00.",
      status: "IN_PROGRESS" as const,
      followUpRequired: true,
      followUpNote: "Call requester back at 14:00 to verify successful login.",
      attachmentNotes: null,
      performedById: somsriId, // Demonstrates a different staff member contributing action (BR-02)
      assigneeId: somchaiId,
    },
    {
      ticketId: tkt2Id,
      description: "Analyzed VPN gateway connection logs and firewall packet drops.",
      result: "Detected MTU packet fragmentation causing tunnel resets on UDP port 1194.",
      status: "COMPLETED" as const,
      followUpRequired: true,
      followUpNote: "Apply MTU 1400 clamping patch on core router and monitor drops for 48h.",
      attachmentNotes: "Wireshark_trace_vpn_drop.pcapng stored on NAS share.",
      performedById: somchaiId,
      assigneeId: wichaiId,
    },
    {
      ticketId: tkt5Id,
      description: "Adjusted Nginx client_max_body_size to 50M on LEB2 upload ingress gateway.",
      result: "Simulated 35MB file upload completed with HTTP 200 OK in 1.4 seconds.",
      status: "COMPLETED" as const,
      followUpRequired: false,
      followUpNote: null,
      attachmentNotes: "nginx_ingress_diff.patch",
      performedById: somsriId,
      assigneeId: somsriId,
    },
  ];

  for (const act of actionsData) {
    const existing = await prisma.actionTaken.findFirst({
      where: {
        ticketId: act.ticketId,
        description: act.description,
      },
    });

    if (!existing) {
      await prisma.actionTaken.create({
        data: act,
      });
    }
  }
  console.log("Actions Taken seeded successfully.");

  // 6. Seed Sample Comments and Notes
  const existingComment = await prisma.ticketComment.findFirst({ where: { ticketId: tkt1Id } });
  if (!existingComment) {
    await prisma.ticketComment.create({
      data: {
        ticketId: tkt1Id,
        authorId: jenniferId,
        content: "Please look into this urgently as I need access for morning meetings.",
      },
    });
  }

  const existingNote = await prisma.ticketInternalNote.findFirst({ where: { ticketId: tkt1Id } });
  if (!existingNote) {
    await prisma.ticketInternalNote.create({
      data: {
        ticketId: tkt1Id,
        authorId: somchaiId,
        content: "Verified account status in Active Directory. Resetting password token.",
      },
    });
  }
  console.log("Sample ticket comments and internal notes seeded.");
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
