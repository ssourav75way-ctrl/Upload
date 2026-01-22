import express from "express";
import { prisma } from "../lib/PrismaClient.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export const authorRouter = express();

const generateAccessToken = (userId: String, roles: string[]) => {
  return jwt.sign({ userId, roles }, process.env.JWT_SECRET!);
};
const generateRefreshToken = (userId: string, roles: string[]) => {
  return jwt.sign({ userId, roles }, process.env.REFRESH_TOKEN!);
};

authorRouter.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const authorRole = await prisma.role.findFirst({
      where: { name: "AUTHOR" },
    });
    const userRole = await prisma.role.findFirst({
      where: {
        name: "USER",
      },
    });
    if (!authorRole || !userRole) throw new Error("Author role not found");

    if (!authorRole) {
      return res.status(500).json({ message: "Author  role not found" });
    }

    const user = await prisma.user.create({
      data: {
        email,

        password: passwordHash,
        role: {
          create: [{ roleId: authorRole.id }, { roleId: userRole.id }],
        },
      },
      include: {
        role: {
          include: { role: true },
        },
      },
    });
    const roles = user.role.map((r) => r.role.name);
    const accessToken = generateAccessToken(user.id, roles);
    const refreshToken = generateRefreshToken(user.id, roles);
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshToken,
        refreshTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return res.status(201).json({
      message: "Singup Successfull",
      id: user.id,
      accessToken: accessToken,
      refreshToken: refreshToken,
      roles: roles,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Signup failed" });
  }
});

authorRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: { role: true },
        },
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const roles = user.role.map((r) => r.role.name);
    const accessToken = generateAccessToken(user.id, roles);
    const refreshToken = generateRefreshToken(user.id, roles);
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshToken,
        refreshTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        roles,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
});
