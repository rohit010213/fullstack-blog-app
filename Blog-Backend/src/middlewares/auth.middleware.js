import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';


export const verifyJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];
        console.log('Received Token:', token);

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log('Decoded Token:', decodedToken); 

        const user = await User.findById(decodedToken._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;

        next();
    } catch (error) {
        console.error('JWT Error:', error); 
        next(new ApiError(401, error.message || "Invalid access token"));
    }
};
