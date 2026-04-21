import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { postRouter } from "./routes/postRouter.js";
import { userRouter } from "./routes/userRouter.js";
import { authRouter } from "./routes/authRouter.js";
import { authorRouter } from "./routes/AuthorRouter.js";
import { uploadRouter } from "./routes/uploadRouter.js";

const app = express();

app.use(express.json());
app.use(cors());

// Ensure uploads folder exists at project root (backend/uploads)
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Files are served via protected routes in `uploadRouter` to enforce ownership.
// Note: we keep the `uploads` directory on disk but do NOT expose it statically.

app.use("/v1/auth", authRouter);
app.use("/v1/user", userRouter);
app.use("/v1/post", postRouter);
app.use("/v1/author", authorRouter);
app.use("/v1/upload", uploadRouter);

app.listen("3000", () => {
  console.log("Server running");
});
