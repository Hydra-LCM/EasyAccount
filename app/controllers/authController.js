import User from "../models/userModel.js";
import md5 from "md5";
import generateTokenAndPersonalKey from "../middleware/generateToken.js";
import { sendResponse } from "../utils/response.js";
import { generateCode as generateVerificationCode } from "../utils/generateCode.js";
import { sendConfirmationEmail } from '../utils/email.js';


export const registerController = async (req, res) => {
    req.body.password = md5(req.body.password);
    const code = generateVerificationCode();

    const newUser = new User({
        username: req.body.username,
        password: req.body.password,
        role: req.body.role,
        confirmationCode: code       
    });

    try {
        const foundUser = await User.findOne({ username: req.body.username, password: req.body.password });
        if (foundUser) {
            return sendResponse(res, 409, "Conflict", "Email already exists" );
        }
        let savedUser = await newUser.save();
        delete savedUser.password;
        const confirmationReturn = await sendConfirmationEmail(savedUser);
        if(confirmationReturn.data){
            return sendResponse(res, 200, confirmationReturn.data, "User registered successfully");
        } else {
            return sendResponse(res, 400, "EmailError", confirmationReturn.message);
        }
        
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

export const confirmEmailController = async (req, res) => {
    const { username, confirmationCode } = req.body;

    try {
        const user = await User.findOne({ username, confirmationCode });
        if (!user) {
            return sendResponse(res, 401, "Forbidden", "Invalid username or confirmation code" );
        }
        
        user.isActive = true;
        await user.save();

        return sendResponse(res, 200, null, "Email confirmed successfully");
    } catch (err) {
        return sendResponse(res, 400, err.name, err.message);
    }
};

export const resendConfirmationCodeController = async (req, res) => {
    const { username } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return sendResponse(res, 404, "Not Found", "User not found");
        }

        if (user.isActive) {
            return sendResponse(res, 400, "Bad Request", "User is already active");
        }

        user.confirmationCode = generateVerificationCode(); // Gerar um novo código de confirmação
        await user.save();
        delete user.password;
        await sendConfirmationEmail(user);
        return sendResponse(res, 200, user, "Confirmation code resent successfully");
    } catch (err) {
        return sendResponse(res, 400, err.name, err.message);
    }
};