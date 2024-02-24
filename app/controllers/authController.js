import User from "../models/userModel.js";
import md5 from "md5";
import generateTokenAndPersonalKey from "../middleware/generateToken.js";
import { sendResponse } from '../utils/response.js';

export const registerController = async (req, res) => {
    req.body.password = md5(req.body.password);

    const newUser = new User({
        username: req.body.username,
        password: req.body.password,
        role: req.body.role
    });

    try {
        const foundUser = await User.findOne({ username: req.body.username, password: req.body.password });
        if (foundUser) {
            return sendResponse(res, 409, "Conflict", "Email already exists" );
        }
        //verificação de email
        let savedUser = await newUser.save();
        delete savedUser.password;
        return sendResponse(res, 200, savedUser, "User registered successfully" );
    } catch (err) {
        return sendResponse(res, 400, err.name, err.message );
    }
};

export const loginController = async (req, res) => {
    req.body.password = md5(req.body.password);

    try {
        const user = await User.findOne({ username: req.body.username, password: req.body.password });
        if (!user) {
            return sendResponse(res, 401, "Forbidden", "Invalid username or password" );
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

export const logoutController = async (req, res) => {
    req.body.password = md5(req.body.password);

    try {
        const user = await User.findOne({ username: req.body.username, password: req.body.password });
        if (!user) {
            return sendResponse(res, 401, "Forbidden", "Invalid username or password");
        }
        //setting personalKey to default value, to invalidate the token
        user.personalKey = "-";
        await user.save();
        return sendResponse(res, 200, null, "You have been logged out successfully");
    }
    catch (err) {
        return sendResponse(res, 400, err.name, err.message);
    }
};