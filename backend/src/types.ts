import z from "zod";

export interface AuthRequest extends Request {
  user?: {
    userId: String;
    roles: String[];
  };
}

export const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(6),
  newPassword: z.string().min(6),
});
