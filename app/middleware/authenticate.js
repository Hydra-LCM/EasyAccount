import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import sendResponse from '../utils/response.js';

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return sendResponse(res, 401, null, "Authentication token is required");
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return sendResponse(res, 401, null, "Token format is 'Bearer [token]'");
    }
    const token = parts[1];
    try {
        const decodedToken = jwt.decode(token, { complete: true });
        if (!decodedToken) {
            return sendResponse(res, 403, "Error to decode", "Redirect to login");
        }

        const user = await User.findById(decodedToken.payload.id);
        if (!user) {
            return sendResponse(res, 401, "User not found by id with token decode", "Redirect to login");
        }

        const secretKey = process.env.JWT_SECRET + user.personalKey;
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return sendResponse(res, 403, err.name, err.message);
            }
            req.user = decoded;
            next();
        });
    } catch (err) {
        return sendResponse(res, 403, err.name, err.message);
    }
};

export default authenticateToken;