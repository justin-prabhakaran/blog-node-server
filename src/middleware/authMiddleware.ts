import express from "express";
import jwt from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            userId?: string;  // Add userId property
        }
    }
}

const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized access. Token missing or invalid." });
        }

        const token = authHeader.split(" ")[1];

        const secretKey = process.env.JWT_TOKEN_SECRET_KEY ?? "defaultSecretKey";
        const decoded: any = jwt.verify(token, secretKey);

        req.userId = decoded.id;

        next();
    } catch (err) {
        console.error(err);
        res.status(401).json({ error: "Unauthorized access. Invalid or expired token." });
    }
};

export { authMiddleware };
