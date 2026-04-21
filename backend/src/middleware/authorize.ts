import type { Request, Response, NextFunction } from "express";

export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) return res.status(403).json({ message: "Forbidden" });

    next();
  };
};
