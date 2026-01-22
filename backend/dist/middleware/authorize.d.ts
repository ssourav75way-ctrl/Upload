import type { Request, Response, NextFunction } from "express";
export declare const authorize: (allowedRoles: string[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=authorize.d.ts.map