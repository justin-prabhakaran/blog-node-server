import express from "express";
import {authMiddleware} from "../middleware/authMiddleware";
import {Blog, Comment} from "../model/user";

const commentRouter = express.Router();


// @ts-ignore
commentRouter.post("/api/commands", authMiddleware, async (req, res) => {
    const { blogPostId, content } = req.body;
    const userId = req.body.userId;

    try {
        if (!blogPostId || !content) {
            return res.status(400).json({ error: "Blog Post ID and content are required." });
        }

        const newComment = new Comment({
            content,
            author: userId,
            createdAt: new Date(),
        });

        await newComment.save();

        const updatedBlog = await Blog.findByIdAndUpdate(
            blogPostId,
            { $push: { comments: newComment._id } },
            { new: true }
        ).populate("comments", "content author createdAt");


        res.status(201).json(updatedBlog);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add comment." });
    }
});

// @ts-ignore
commentRouter.get("/api/commands/:blogId", async (req, res) => {
    const { blogId } = req.params;

    try {
        const blog = await Blog.findById(blogId).populate("comments", "content author createdAt");

        if (!blog) {
            return res.status(404).json({ error: "Blog post not found" });
        }

        res.status(200).json(blog.comments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch comments" });
    }
});

export {commentRouter}