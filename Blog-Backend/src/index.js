import express from "express";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import blogRouter from "./routes/blog.routes.js";
import connectDB from "./db/index.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000; // Use Render's dynamic PORT
const __dirname = path.resolve();

// CORS setup for both local & production
// app.use(cors({
//     origin : "http://localhost:5173",
//     credentials : true,
// }))


app.use(cors({
    origin: (origin, callback) => {
        if (!origin || origin.includes("render.com") || origin.includes("localhost")) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));


// Middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Serve static files
app.use("/public", express.static(path.join(process.cwd(), "public")));

// Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/blogs", blogRouter);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../Blog-frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../Blog-frontend/dist/index.html"));
    });
}

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    connectDB();
});

export default app;
