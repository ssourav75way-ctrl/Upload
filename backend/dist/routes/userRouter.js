import express from "express";
export const userRouter = express();
import { prisma } from "../lib/PrismaClient.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorize.js";
import { sendEmail } from "../email/email.js";
import { ChangePasswordSchema } from "../types.js";
//get the profile
userRouter.get("/profile", authenticate, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                email: true,
                createdAt: true,
                role: { include: { role: true } },
            },
        });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const roles = user.role.map((r) => r.role.name);
        res.json({ ...user, roles });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch profile" });
    }
});
//update the profile
userRouter.put("/profile", authenticate, async (req, res) => {
    try {
        const { email, password } = req.body;
        const data = {};
        if (email)
            data.email = email;
        if (password)
            data.password = await bcrypt.hash(password, 10);
        const user = await prisma.user.update({
            where: { id: req.user.userId },
            data,
            select: { id: true, email: true, createdAt: true },
        });
        res.json(user);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update profile" });
    }
});
userRouter.get("/files-db", authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                files: {
                    orderBy: { uploadedAt: "desc" },
                },
            },
        });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const files = user.files.map((f) => ({
            id: f.id,
            url: `/v1/upload/file/${f.id}`,
            uploadedAt: f.uploadedAt,
        }));
        console.log("✓ Files returned:", files.length);
        return res.status(200).json(files);
    }
    catch (err) {
        console.error("✗ Error in /files-db:", err);
        return res.status(500).json({ message: "Failed to list files" });
    }
});
// Get a specific user(Admin only route)
userRouter.get("/:id", authenticate, authorize(["ADMIN"]), async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            select: {
                id: true,
                email: true,
                createdAt: true,
                role: { include: { role: true } },
            },
        });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const roles = user.role.map((r) => r.role.name);
        res.json({ ...user, roles });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch user" });
    }
});
userRouter.put("/:id", authenticate, authorize(["ADMIN"]), async (req, res) => {
    try {
        const { email, password, roles } = req.body;
        const data = {};
        if (email)
            data.email = email;
        if (password)
            data.password = await bcrypt.hash(password, 10);
        const updatedUser = await prisma.user.update({
            where: { id: req.params.id },
            data,
            select: { id: true, email: true, createdAt: true },
        });
        if (Array.isArray(roles)) {
            await prisma.userRole.deleteMany({
                where: { userId: req.params.id },
            });
            for (const roleName of roles) {
                const role = await prisma.role.findFirst({ where: { name: roleName } });
                if (role) {
                    await prisma.userRole.create({
                        data: { userId: req.params.id, roleId: role.id },
                    });
                }
            }
        }
        res.json(updatedUser);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update user" });
    }
});
userRouter.delete("/:id", authenticate, authorize(["ADMIN"]), async (req, res) => {
    try {
        await prisma.user.delete({ where: { id: req.params.id } });
        res.json({ message: "User deleted successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete user" });
    }
});
userRouter.post("/forgetPassword", async (req, res) => {
    const body = req.body;
    const { email } = body;
    console.log(email);
    try {
        const user = await prisma.user.findFirst({
            where: {
                email: email,
            },
        });
        console.log(user);
        if (!user) {
            return res.status(400).json("there is no account with this mail");
        }
        const resetToken = jwt.sign(user.id, process.env.RESET_TOKEN);
        const resetLink = `https://localhost:3000/reset-password/${resetToken}`;
        await sendEmail(email, "Reset your password", `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`);
        res.json({ message: "Reset email sent" });
    }
    catch (e) {
        console.log(e);
        return res.json("No account with this email");
    }
});
// Get all users (public)
userRouter.get("/", async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                createdAt: true,
            },
        });
        return res.status(200).json(users);
    }
    catch (error) {
        return res.status(404).json("Error getting the users");
    }
});
userRouter.post("/changePassword", authenticate, async (req, res) => {
    const userId = req.user?.userId;
    const body = req.body;
    const parsed = ChangePasswordSchema.safeParse(body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input" });
    }
    const { oldPassword, newPassword } = parsed.data;
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
        if (!isOldPasswordCorrect) {
            return res.status(400).json({ message: "Old password is incorrect" });
        }
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword },
        });
        return res.status(200).json({ message: "Password changed successfully" });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});
//# sourceMappingURL=userRouter.js.map