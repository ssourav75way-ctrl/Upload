import z from "zod";
export interface AuthRequest extends Request {
    user?: {
        userId: String;
        roles: String[];
    };
}
export declare const ChangePasswordSchema: z.ZodObject<{
    oldPassword: z.ZodString;
    newPassword: z.ZodString;
}, z.z.core.$strip>;
//# sourceMappingURL=types.d.ts.map