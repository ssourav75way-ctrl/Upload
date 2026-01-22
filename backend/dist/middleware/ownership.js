import { prisma } from "../lib/PrismaClient.js";
export const ownsPostOrAdmin = async (req, res, next) => {
    try {
        const post = await prisma.post.findUnique({
            where: { id: req.params.id }
        });
        if (!post)
            return res.status(404).json({ message: "Post not found" });
        if (req.user?.roles.includes("ADMIN"))
            return next();
        if (post.authorId !== req.user?.userId) {
            return res.status(403).json({ message: "Forbidden" });
        }
        next();
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
//# sourceMappingURL=ownership.js.map