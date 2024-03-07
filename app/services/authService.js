import User from "../models/userModel.js";
import md5 from "md5";
import jwt from 'jsonwebtoken';
import generateTokenAndPersonalKey from "../middleware/generateToken.js";
import { sendResponse } from "../utils/response.js";
import { controlAttemptsMiddleware } from '../middleware/controlAttempts.js';

export const login = async (req, res) => {
    try {
        req.body.password = md5(req.body.password);
        req.action = 'login';
        const attempts = await controlAttemptsMiddleware(req, res);
        if (attempts.data) {
            return sendResponse(res, 400, attempts.data, attempts.message);
        }

        const user = await User.findOne({ username: req.body.username, password: req.body.password });

        if (!user) {
            return sendResponse(res, 403, "Forbidden", "Invalid username or password");
        }

        if (!user.isActive) {
            return sendResponse(res, 401, "Unauthorized", "Please confirm your e-mail");
        }

        if(user.isPassChangeAllowed){
            return sendResponse(res, 401, "Unauthorized", "User is blocked to login, but authorized to change password");
        }

        const newTokenAndKey = await generateTokenAndPersonalKey(user);
        const token = newTokenAndKey.token;
        const personalKey = newTokenAndKey.personalKey;
        user.personalKey = personalKey;
        await user.save();
        return sendResponse(res, 200, token, "User logged successfully");
    } catch (err) {
        return sendResponse(res, 400, err.name, err.message);
    }
};

export const logout = async (req, res) => {

    try {
        const authHeader = req.headers.authorization;
        const parts = authHeader.split(' ');
        const token = parts[1];
        const decodedToken = jwt.decode(token, { complete: true });
        const user = await User.findById(decodedToken.payload.id).select('-password');
        if (!user) {
            return sendResponse(res, 401, "Forbidden", "Invalid username or password");
        }
        user.personalKey = "-";
        await user.save();
        return sendResponse(res, 200, null, "You have been logged out successfully");
    }
    catch (err) {
        return sendResponse(res, 400, err.name, err.message);
    }
};

