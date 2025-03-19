import { Blog } from "../models/blog.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiError from "../utils/ApiError.js";


const createBlog = async (req, res, next) => {
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            throw new ApiError(400, "All fields are required");
        }

        if (!req.file) {
            throw new ApiError(400, "Image is required");
        }

        // Upload image to Cloudinary
        const imageUrl = await uploadOnCloudinary(req.file.path);
        if (!imageUrl) {
            throw new ApiError(500, "Image upload failed");
        }

        const newBlog = await Blog.create({
            title,
            description,
            image: imageUrl // Save Cloudinary URL
        });

        return res.status(201).json({ success: true, blog: newBlog });
    } catch (error) {
        console.error("Error creating blog:", error);
        next(error);
    }
};



const getBlogs = async (req, res, next) => {
    try {
        const blogs = await Blog.find();
        return res.status(200).json({ success: true, blogs });
    } catch (error) {
        next(error);
    }
};

const updateBlog = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;

        const existingBlog = await Blog.findById(id);
        if (!existingBlog) {
            throw new ApiError(404, "Blog not found");
        }

        let imageUrl = existingBlog.image;

        if (req.file) {
            const localFilePath = req.file.path;
            imageUrl = await uploadOnCloudinary(localFilePath);
        }

        const updatedBlog = await Blog.findByIdAndUpdate(
            id,
            { title, description, image: imageUrl },
            { new: true }
        );

        return res.status(200).json({ success: true, blog: updatedBlog });
    } catch (error) {
        next(error);
    }
};

const deleteBlog = async (req, res, next) => {
    try {
        const { id } = req.params;

        const deletedBlog = await Blog.findByIdAndDelete(id);

        if (!deletedBlog) {
            throw new ApiError(404, "Blog not found");
        }

        return res.status(200).json({ success: true, message: "Blog deleted successfully" });
    } catch (error) {
        next(error);
    }
};

export { createBlog, getBlogs, updateBlog, deleteBlog };
