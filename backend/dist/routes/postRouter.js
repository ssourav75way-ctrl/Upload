import express from "express";
import { prisma } from "../lib/PrismaClient.js";
import { PostStatus } from "../generated/prisma/enums.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorize.js";
export const postRouter = express.Router();
// Get all published posts (public)
postRouter.get("/", async (req, res) => {
    try {
        const posts = await prisma.post.findMany({
            where: { status: PostStatus.DRAFT },
            include: { author: true },
            orderBy: { createdAt: "desc" },
        });
        res.json(posts);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch posts" });
    }
});
// Get specific post by id (public)
postRouter.get("/:id", async (req, res) => {
    try {
        const post = await prisma.post.findUnique({
            where: { id: req.params.id },
            include: { author: true },
        });
        if (!post)
            return res.status(404).json({ message: "Post not found" });
        res.json(post);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch post" });
    }
});
// Create post (AUTHOR only)
postRouter.post("/", authenticate, authorize(["AUTHOR"]), async (req, res) => {
    try {
        const { title, content, status } = req.body;
        const post = await prisma.post.create({
            data: {
                title,
                content,
                status: status || PostStatus.DRAFT,
                authorId: req.user.userId,
            },
        });
        res.status(201).json(post);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create post" });
    }
});
// Update post (AUTHOR only)
postRouter.put("/:id", authenticate, authorize(["AUTHOR"]), async (req, res) => {
    try {
        const { title, content, status } = req.body;
        const post = await prisma.post.update({
            where: { id: req.params.id },
            data: { title, content, status },
        });
        res.json(post);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update post" });
    }
});
// Delete post (AUTHOR or ADMIN)
postRouter.delete("/:id", authenticate, authorize(["AUTHOR", "ADMIN"]), async (req, res) => {
    try {
        await prisma.post.delete({ where: { id: req.params.id } });
        res.json({ message: "Post deleted successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete post" });
    }
});
//# sourceMappingURL=postRouter.js.map