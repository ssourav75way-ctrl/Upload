import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authenticate } from "../middleware/authMiddleware.js";
import { prisma } from "../lib/PrismaClient.js";
import { sendNotificationToUser } from "../lib/notifications.js";

export const uploadRouter = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = (req as any).user?.userId || "public";
    const dir = path.join(process.cwd(), "uploads", userId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique =
      Date.now() + "-" + Math.random().toString(36).substring(2, 9);
    const ext = path.extname(file.originalname) || "";
    cb(null, unique + ext);
  },
});

const upload = multer({ storage });

// Upload single file. Store server filename and a DB record linking to the user.
uploadRouter.post(
  "/",
  authenticate,
  upload.single("file"),
  async (req, res) => {
    try {
      const userId = (req as any).user!.userId;
      const file = req.file;
      if (!file) return res.status(400).json({ message: "No file uploaded" });

      // create DB record so we can enforce ownership when serving files
      const created = await prisma.file.create({
        data: {
          storedName: file.filename,
          path: `/uploads/${userId}/${file.filename}`,
          userId,
        },
      });

      // Return a protected URL that will be routed through the server and validated
      const protectedUrl = `/v1/upload/file/${created.id}`;

      return res.status(201).json({
        id: created.id,
        url: protectedUrl,
        uploadedAt: created.uploadedAt,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Upload failed" });
    }
  },
);

uploadRouter.get("/file/:id", authenticate, async (req, res) => {
  try {
    const fileId = req.params.id as string;
    const userId = req.user!.userId;
    const record = await prisma.file.findUnique({ where: { id: fileId } });
    if (!record) return res.status(404).json({ message: "File not found" });
    if (record.userId !== userId)
      return res.status(403).json({ message: "Forbidden" });

    const filePath = path.join(
      process.cwd(),
      "uploads",
      record.userId,
      record.storedName,
    );
    if (!fs.existsSync(filePath))
      return res.status(404).json({ message: "File not found on disk" });

    return res.sendFile(filePath);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to serve file" });
  }
});

// Delete a file by DB id — only the owner can delete
uploadRouter.delete("/:id", authenticate, async (req, res) => {
  try {
    const fileId = req.params.id as string;
    const userId = req.user!.userId;
    const record = await prisma.file.findUnique({ where: { id: fileId } });
    if (!record) return res.status(404).json({ message: "File not found" });
    if (record.userId !== userId)
      return res.status(403).json({ message: "Forbidden" });

    const filePath = path.join(
      process.cwd(),
      "uploads",
      record.userId,
      record.storedName,
    );
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.error("Failed to delete file from disk:", e);
      }
    }

    await prisma.file.delete({ where: { id: fileId } });

    return res.status(200).json({ message: "File deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to delete file" });
  }
});
