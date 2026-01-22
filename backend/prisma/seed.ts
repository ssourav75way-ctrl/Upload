// prisma/seed.ts
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import bcrypt from "bcrypt";

const accelerateUrl="prisma://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza195b01HWHpjMVpkSGo2aFFZQWxaaWEiLCJhcGlfa2V5IjoiMDFLRkFKNFJHMEtTS0hGRjdNNDJFNTRaV0ciLCJ0ZW5hbnRfaWQiOiJkMzc1OTUxY2Y0MWVmMTk4MWUzNmQ0YTVlNzEwZTI4MGIzMzU5ZmUxYjYyNmU3NTA3NmQ4MzlkMTIyOWFhNWM2IiwiaW50ZXJuYWxfc2VjcmV0IjoiNWJkZTg3OWItZmY0Mi00MGU2LThkODQtZDQ1ZWEzM2UxOTgwIn0.mmkqviHpP-613_xZmQPA0YdA5nPVuZt5YUdydHFV7UE"
const prisma = new PrismaClient({accelerateUrl,
  log: ["info", "warn", "error"],
});

async function main() {
  const roles = ["ADMIN", "AUTHOR", "USER"] as const;
  const adminEmail = "admin@gmail.com";
  const adminPassword = "admin123";

  
  await prisma.role.createMany({
    data: roles.map((name) => ({ name })),
    skipDuplicates: true, 
  });
 
  let adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!adminUser) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminRole = await prisma.role.findFirst({ where: { name: "ADMIN" } });
    if (!adminRole) throw new Error("ADMIN role not found");

    
    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: {
          create: {
            roleId: adminRole.id,
          },
        },
      },
      include: {
        role: {
          include: { role: true },
        },
      },
    });
    
    console.log(" Admin user already exists");
  }
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
