import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export interface AuthRequest extends Request {
    userId?: string;
}

interface TokenPayload extends JwtPayload {
    userId: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const tokenValue = token.split(" ")[1];
    try {
        const payload = jwt.verify(tokenValue, JWT_SECRET) as TokenPayload;
        req.userId = payload.userId;
        next();
    } catch (err: any) {
        res.status(401).json({ message: "Unauthorized" });
    }
}
