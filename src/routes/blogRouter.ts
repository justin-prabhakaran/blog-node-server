import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { Blog } from "../model/user";

const blogRouter = express.Router();


// @ts-ignore
blogRouter.post("/api/blogs", authMiddleware, async (req, res) => {
    const { title, content, tags } = req.body;
    const createdBy = req.userId;

    try {

        const newBlog = new Blog({
            title,
            content,
            tags,
            createdBy,
            createdAt: new Date(),
        });

        await newBlog.save();

        res.status(201).json(newBlog);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create blog post." });
    }
});


// @ts-ignore
blogRouter.put("/api/blog/:id", authMiddleware, async (req, res) => {
    const blogId = req.params.id;
    const updates = req.body;
    const userId = req.userId;

    try {
        // Find the blog post by ID
        const blogPost = await Blog.findById(blogId);

        if (!blogPost) {
            return res.status(404).json({ error: "Blog post not found" });
        }

        if (blogPost.createdBy.toString() !== userId) {
            return res.status(403).json({ error: "You are not authorized to update this blog post" });
        }

        Object.keys(updates).forEach((key) => {
            if (key !== "userId") {
                // @ts-ignore
                blogPost[key] = updates[key];
            }
        });

        blogPost.updatedAt = new Date();

        const updatedBlogPost = await blogPost.save();

        res.status(200).json(updatedBlogPost);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update blog post" });
    }
});


// @ts-ignore
blogRouter.delete("/api/blog/:id", authMiddleware, async (req, res) => {
    const blogId = req.params.id;
    const userId = req.userId;

    try {
        const blogPost = await Blog.findById(blogId);

        if (!blogPost) {
            return res.status(404).json({ error: "Blog post not found" });
        }

        if (blogPost.createdBy.toString() !== userId) {
            return res.status(403).json({ error: "You are not authorized to delete this blog post" });
        }

        await Blog.findByIdAndDelete(blogId);

        res.status(200).json({ message: "Blog post deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete blog post" });
    }
});

export { blogRouter };

//GET /api/blogs?page=1&limit=10&tags=technology,science

blogRouter.get("/api/blogs", async (req, res) => {
    const { page = 1, limit = 10, tags = "" } = req.query;

    const pageNumber = parseInt(page as string);
    const pageSize = parseInt(limit as string);

    try {
        // @ts-ignore
        const tagFilter = tags ? { tags: { $in: tags.split(",") } } : {};

        const blogPosts = await Blog.find(tagFilter)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .populate("createdBy", "username")
            .populate("comments")
            .exec();

        const totalPosts = await Blog.countDocuments(tagFilter);

        const totalPages = Math.ceil(totalPosts / pageSize);

        const responsePosts = blogPosts.map(post => ({
            ...post.toObject(),
            commentCount: post.comments.length,
        }));

        res.status(200).json({
            posts: responsePosts,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalPosts,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch blog posts." });
    }
});

