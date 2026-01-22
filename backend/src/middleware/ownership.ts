import { prisma } from "../lib/PrismaClient.js";
import type { Request , Response, NextFunction } from "express";
import type { AuthRequest } from "./authMiddleware.js";



export const ownsPostOrAdmin = async (req:AuthRequest, res:Response, next:NextFunction) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id as string}
    });

    if (!post) return res.status(404).json({ message: "Post not found" });


    if (req.user?.roles.includes("ADMIN")) return next();

    if (post.authorId !== req.user?.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
