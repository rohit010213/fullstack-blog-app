import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image buffer to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {string} fileName - Original file name for reference
 * @returns {Promise<string>} - Cloudinary secure URL
 */
export const uploadOnCloudinary = (buffer, fileName) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "blogs", resource_type: "image" },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary Upload Error:", error);
                    reject(new Error("Cloudinary upload failed"));
                } else {
                    resolve(result.secure_url);
                }
            }
        );

        uploadStream.end(buffer); // Send buffer data to Cloudinary
    });
};
