import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new ApiError(404, "User not found");

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access tokens");
    }
}

const registerUser = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        if ([username, email, password].some(field => !field?.trim())) {
            throw new ApiError(400, "All fields are required");
        }

        const existedUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existedUser) {
            throw new ApiError(409, "User already exists");
        }

        if (!req.file || !req.file.buffer) {
            throw new ApiError(400, "Avatar file is required");
        }

        // Upload buffer to Cloudinary (PASS BUFFER INSTEAD OF PATH)
        const avatarUrl = await uploadOnCloudinary(req.file.buffer, req.file.originalname);
        console.log("Cloudinary Upload Response:", avatarUrl);

        if (!avatarUrl) {
            throw new ApiError(500, "Failed to upload avatar");
        }

        const user = await User.create({ username, email, password, avatar: avatarUrl });

        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"));
    } catch (error) {
        next(error);
    }
};




const loginUser = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        if (!username && !email) {
            throw new ApiError(400, "Username or email is required");
        }

        const user = await User.findOne({ $or: [{ username }, { email }] });

        if (!user) {
            throw new ApiError(404, "User does not exist");
        }

   
        const isPasswordValid = await user.isPasswordCorrect(password);

        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid user credentials");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        const loggedInUser = await User.findById(user._id)
            .select("username email role")
            .lean();

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully"));
    } catch (error) {
        next(error);
    }
};


const logoutUser = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } }, { new: true });

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        };

        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "User logged out successfully"));
    } catch (error) {
        next(error);
    }
};

const getUserData = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        return res.status(200).json(new ApiResponse(200, user, "User data retrieved successfully"));
    } catch (error) {
        next(error);
    }
};


export {
    registerUser, loginUser, logoutUser,getUserData
};
