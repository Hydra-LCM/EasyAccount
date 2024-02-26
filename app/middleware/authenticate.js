import jwt from "jsonwebtoken";
import User from "../models/userModel.js"
import { sendResponse } from '../utils/response.js';

const authenticateToken = async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return sendResponse(res, 401, null, "Authentication token is required" );
    }

    try {
        const redirectLogin = "Redirect to login";
        const decodedToken = jwt.decode(token, { complete: true });
        if (!decodedToken) {
            return sendResponse(res, 403, "Error to decod", redirectLogin);
        }

        const user = await User.findById(decodedToken.payload.id);
        if (!user) {
            return sendResponse(res, 401, "User not found by id with token decod", redirectLogin);
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