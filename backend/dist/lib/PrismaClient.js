import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
const accelerateUrl = process.env.ACCELERATE_URL;
if (!accelerateUrl) {
    throw new Error("ACCELERATE_URL is required in your environment variables");
}
const prismaClient = new PrismaClient({
    accelerateUrl,
    log: ["query", "info", "warn", "error"],
});
export const prisma = global.prisma ?? prismaClient;
if (process.env.NODE_ENV !== "production") {
    global.prisma = prisma;
}
//# sourceMappingURL=PrismaClient.js.map