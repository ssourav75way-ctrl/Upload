import jwt, {} from "jsonwebtoken";
const ACCESS_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN;
export const generateTokens = (userId, roles) => {
    const accessToken = jwt.sign({ userId, roles }, ACCESS_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId, roles }, REFRESH_SECRET, { expiresIn: "1d" });
    return { accessToken, refreshToken };
};
export const authenticate = async (req, res, next) => {
    const rawAuthHeader = req.headers.authorization;
    let accessToken;
    if (typeof rawAuthHeader === "string") {
        if (rawAuthHeader.startsWith("Bearer ")) {
            accessToken = rawAuthHeader.slice(7); // Remove "Bearer " prefix
        }
        else if (rawAuthHeader.trim()) {
            accessToken = rawAuthHeader.trim(); // Raw token without Bearer
        }
    }
    const refreshTokenHeader = req.headers["x-refresh-token"];
    if (accessToken) {
        try {
            const payload = jwt.verify(accessToken, ACCESS_SECRET);
            req.user = { userId: payload.userId, roles: payload.roles };
            return next();
        }
        catch (error) {
        }
    }
    if (!refreshTokenHeader || Array.isArray(refreshTokenHeader)) {
        return res.status(401).json({ message: "No valid access or refresh token provided" });
    }
    try {
        const decoded = jwt.verify(refreshTokenHeader, REFRESH_SECRET);
        const payload = { userId: decoded.userId, roles: decoded.roles || [] };
        req.user = payload;
        const newAccessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
        res.setHeader("access-token", newAccessToken);
        return next();
    }
    catch (error) {
        return res.status(401).json({ message: "Invalid refresh token" });
    }
};
//# sourceMappingURL=authMiddleware.js.map