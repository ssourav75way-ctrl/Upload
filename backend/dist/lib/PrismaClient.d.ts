import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
declare global {
    var prisma: PrismaClient | undefined;
}
export declare const prisma: PrismaClient;
//# sourceMappingURL=PrismaClient.d.ts.map