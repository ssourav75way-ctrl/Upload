import type { Request, Response, NextFunction } from "express";
export interface AuthRequest extends Request {
    user?: {
        userId: string;
        roles: string[];
    };
}
export declare const generateTokens: (userId: string, roles: string[]) => {
    accessToken: string;
    refreshToken: string;
};
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=authMiddleware.d.ts.map