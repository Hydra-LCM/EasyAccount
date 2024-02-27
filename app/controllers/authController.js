import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import md5 from "md5";
import generateTokenAndPersonalKey from "../middleware/generateToken.js";
import { sendResponse } from "../utils/response.js";
import sendEmail from '../utils/email.js';
import { generateCode as generateVerificationCode } from "../utils/generateCode.js";
import { controlAttemptsMiddleware } from '../middleware/controlAttempts.js';
import { confirmationTemplate, recoveryPassTemplate } from "../assets/emails/emailsTemplate.js";


export const registerController = async (req, res) => {
    req.body.password = md5(req.body.password);
    const code = generateVerificationCode();

    const newUser = new User({
        username: req.body.username,
        password: req.body.password,
        role: req.body.role,
        confirmationCode: code,       
    });

    try {
        const foundUser = await User.findOne({ username: req.body.username, password: req.body.password });
        if (foundUser) {
            return sendResponse(res, 409, "Conflict", "Email already exists" );
        }
        let savedUser = await newUser.save();
        const confirmationReturn = await sendEmail(savedUser, "Código de Confirmação - HYDRA", confirmationTemplate);

        if (confirmationReturn.data) {
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
        req.action = 'login';
        const attempts = await controlAttemptsMiddleware(req, res);
        if (attempts.data) {
            return sendResponse(res, 200, attempts.data, attempts.message);
        }

        const user = await User.findOne({ username: req.body.username, password: req.body.password });

        if (!user) {
            return sendResponse(res, 403, "Forbidden", "Invalid username or password");
        }

        if (!user.isActive) {
            return sendResponse(res, 401, "Unauthorized", "Please confirm your e-mail");
        }

        const newTokenAndKey = await generateTokenAndPersonalKey(user);
        const token = newTokenAndKey.token;
        const personalKey = newTokenAndKey.personalKey;
        user.personalKey = personalKey;
        await user.save();
        return sendResponse(res, 200, token, "User logged successfully");
    } catch (err) {
        console.log(err);
        return sendResponse(res, 400, err.name, err.message);
    }
};

export const logoutController = async (req, res) => {
    req.body.password = md5(req.body.password);

    try {
        const user = await User.findOne({ username: req.body.username, password: req.body.password }).select('-password');
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

export const confirmEmailController = async (req, res) => {
    const code = req.body.code;

    try {
        req.action = 'confirmationEmail';
        await controlAttemptsMiddleware(req, res);

        const user = await User.findOne({ username: req.body.username, confirmationCode: code });
        if (user) {
            user.isActive = true;
            await user.save();
            return sendResponse(res, 200, null, "Email confirmed successfully!");
        } else {
            return sendResponse(res, 400, code, "Wrong code!");
        }
    } catch (err) {
        return sendResponse(res, 400, err.name, err.message);
    }
};

export const resendConfirmationCodeController = async (req, res) => {

    const token = req.headers.authorization;
    const decodedToken = jwt.decode(token, { complete: true });

    try {
        const user = await User.findById(decodedToken.payload.id).select('-password');

        if (user.isActive) {
            return sendResponse(res, 400, "Bad Request", "User is already active");
        }

        req.action = 'resend';
        await controlAttemptsMiddleware(req, res);

        user.confirmationCode = generateVerificationCode();
        await user.save();
        await sendConfirmationEmail(user);
        return sendResponse(res, 200, user, "Confirmation code resent successfully");
    } catch (err) {
        return sendResponse(res, 400, err.name, err.message);
    }
};

export const sendPassRecovery = async (req, res) => {
    const code = generateVerificationCode();

    try {
        const foundUser = await User.findOne({ username: req.body.username });
        if (!foundUser) {
            return sendResponse(res, 401, "Email not found", "Email is not registered!" );
        }
        foundUser.confirmationCode = code;
        await foundUser.save();
        const confirmationReturn = await sendEmail(foundUser, "Código de recuperação de senha - HYDRA", recoveryPassTemplate);

        if (confirmationReturn.data) {
            return sendResponse(res, 200, confirmationReturn.data, "Recovery Pass Email sended");
        } else {
            return sendResponse(res, 400, "EmailError", confirmationReturn.message);
        }
        
    } catch (err) {
        return sendResponse(res, 400, err.name, err.message );
    }
};

export const confirmRecoveryPassCode = async (req, res) => {
    const code = req.body.code;

    try {
        req.action = 'confirmationPassRecovery';
        await controlAttemptsMiddleware(req, res);

        const user = await User.findOne({ username: req.body.username, confirmationCode: code }).select('-password');
        if (user) {
            return sendResponse(res, 200, user, "Correct code!");
        } else {
            return sendResponse(res, 400, code, "Wrong code!");
        }
    } catch (err) {
        return sendResponse(res, 400, err.name, err.message);
    }
};