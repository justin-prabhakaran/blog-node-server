import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../model/user";

const userRouter = express.Router();

const secretKey = process.env.JWT_TOKEN_SECRET_KEY ?? "defaultSecretKey";

// @ts-ignore
userRouter.post("/api/register", async (req: express.Request, res: express.Response) => {
    try {
        const { username, password, email, role } = req.body;

        // Validate input
        if (!username || !password || !email) {
            return res.status(400).json({ error: "Username, email, and password are required." });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User with this email already exists." });
        }

        // Hash the password
        const hashPass = await bcrypt.hash(password, 10);

        // Create a new user
        const user = new User({
            username,
            password: hashPass,
            email,
            role
        });

        // Save the user to the database
        await user.save();

        // Generate JWT token containing only the user's id
        const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: "1h" });

        // Exclude password from the response
        const { password: _, ...userDetails } = user.toObject();

        // Send response
        res.status(201).json({ ...userDetails, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error." });
    }
});

// User Login Endpoint
// @ts-ignore
userRouter.post("/api/login", async (req: express.Request, res: express.Response) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required." });
        }

        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: "Invalid username or password." });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid username or password." });
        }

        // Generate JWT token containing only the user's id
        const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: "1h" });

        // Exclude password from the response
        const { password: _, ...userDetails } = user.toObject();

        // Send response
        res.status(200).json({ ...userDetails, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error." });
    }
});

export { userRouter };
