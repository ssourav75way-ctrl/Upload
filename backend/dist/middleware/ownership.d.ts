import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./authMiddleware.js";
export declare const ownsPostOrAdmin: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=ownership.d.ts.map