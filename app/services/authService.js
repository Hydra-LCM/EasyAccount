import User from "../models/userModel.js";
import md5 from "md5";
import jwt from 'jsonwebtoken';
import generateTokenAndPersonalKey from "../utils/generateToken.js";
import controlAttemptsMiddleware from '../middleware/controlAttempts.js';

export const login = async (req) => {
    req.body.password = md5(req.body.password);
    req.action = 'login';
    const attempts = await controlAttemptsMiddleware(req);
    if (attempts.data) {
        return { statusCode: 429, data: attempts.data, message: attempts.message }
    }

    const user = await User.findOne({ username: req.body.username, password: req.body.password });

    if (!user) {
        return { statusCode: 403, data: "Forbidden", message: "Invalid username or password" }
    }

    if (!user.isActive) {
        return { statusCode: 401, data: "Unauthorized", message: "Please confirm your e-mail" }
    }

    if (user.isPassChangeAllowed){
        return { statusCode: 401, data: "Unauthorized", message: "User is blocked to login, but authorized to change password" }
    }

    const newTokenAndKey = await generateTokenAndPersonalKey(user);
    const token = newTokenAndKey.token;
    const personalKey = newTokenAndKey.personalKey;
    user.personalKey = personalKey;
    await user.save();
    return { statusCode: 200, data: token, message: "User logged successfully" } 
};


export const logout = async (authorization) => {
    const authHeader = authorization;
    const parts = authHeader.split(' ');
    const token = parts[1];
    const decodedToken = jwt.decode(token, { complete: true });
    const user = await User.findById(decodedToken.payload.id).select('-password');
    user.personalKey = "-";
    await user.save();
    return { statusCode: 200, data: null, message: "You have been logged out successfully" };
};

