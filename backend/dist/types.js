import z from "zod";
export const ChangePasswordSchema = z.object({
    oldPassword: z.string().min(6),
    newPassword: z.string().min(6),
});
//# sourceMappingURL=types.js.map