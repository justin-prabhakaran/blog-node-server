import mongoose, { Schema, Document } from "mongoose";

// Define Role Enum
enum Role {
    ADMIN = "ADMIN",
    USER = "USER",
}

// User Schema
const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
        },
        email: {
            type: String,
            unique: true,
            required: [true, "Email is required"],
            validate: {
                validator: function (v: string) {
                    return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
                },
                message: "Invalid email format",
            },
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        role: {
            type: String,
            enum: Object.values(Role),
            default: Role.USER,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Blog Schema
const BlogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
        },
        content: {
            type: String,
            default: "",
        },
        tags: {
            type: [String],
            required: [true, "At least one tag is required"],
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Creator is required"],
        },
        comments: [
            {
                type: [Schema.Types.ObjectId],
                ref: "Comment",
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Comments Schema
const CommentsSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: [true, "Comment content is required"],
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Author is required"],
        },
    },
    {
        timestamps: true,
    }
);

// Define Models
const User = mongoose.model("User", UserSchema);
const Blog = mongoose.model("Blog", BlogSchema);
const Comment = mongoose.model("Comment", CommentsSchema);

export { User, Blog, Comment, Role };
