import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import md5 from "md5";
import { sendResponse } from "../utils/response.js";
import sendEmail from '../utils/email.js';
import { generateCode as generateVerificationCode } from "../utils/generateCode.js";
import { confirmationTemplate } from "../assets/emails/emailsTemplate.js";
import { controlAttemptsMiddleware } from '../middleware/controlAttempts.js'
import { recoveryPassTemplate } from "../assets/emails/emailsTemplate.js";

export const userRegister = async (req, res) => {
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

export const userRecoveryPass = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username }).select('-password');
        if (user) {
            if (user.isPassChangeAllowed) {
                const password1 = req.body.password;
                const password2 = req.body.confirmpassword;
            
                if(password1 != password2){
                    return sendResponse(res, 400, "Unauthorized", "Passwords didnt match!");
                }
                user.password = md5(password1);
                user.isPassChangeAllowed = false;
                user.save();
                return sendResponse(res, 200, "Sucess", "Pass changed");
            } else {
                return sendResponse(res, 401, "Unauthorized", "User not allowed to change pass");
            }
        } else {
            return sendResponse(res, 401, "User not found!", "User not found!");
        }
    } catch (err) {
        return sendResponse(res, 400, err.name, err.message);
    }
};


export const confirmEmail = async (req, res) => {
    const code = req.body.code;

    try {
        req.action = 'confirmationEmail';
        const attempts = await controlAttemptsMiddleware(req, res);
        if (attempts.data) {
            return sendResponse(res, 400, attempts.data, attempts.message);
        }

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

export const resendConfirmationCode = async (req, res) => {

    try {
        const authHeader = req.headers.authorization;
        const parts = authHeader.split(' ');
        const token = parts[1];
        const decodedToken = jwt.decode(token, { complete: true });
        const user = await User.findById(decodedToken.payload.id).select('-password');

        if (user.isActive) {
            return sendResponse(res, 400, "Bad Request", "User is already active");
        }

        req.action = 'resend';
        const attempts = await controlAttemptsMiddleware(req, res);
        if (attempts.data) {
            return sendResponse(res, 400, attempts.data, attempts.message);
        }

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
        const foundUser = await User.findOne({ username: req.body.username }).select('-password');
        if (!foundUser) {
            return sendResponse(res, 401, "Email not found", "Email is not registered!" );
        }

        req.action = 'resendRecovery';
        const attempts = await controlAttemptsMiddleware(req, res);
        if (attempts.data) {
            return sendResponse(res, 400, attempts.data, attempts.message);
        }

        foundUser.recoveryCode = code;
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
        const attempts = await controlAttemptsMiddleware(req, res);
        if (attempts.data) {
            return sendResponse(res, 400, attempts.data, attempts.message);
        }

        const user = await User.findOne({ username: req.body.username, recoveryCode: code }).select('-password');
        if (user) {
            if (user.isRecoveryCodeRecent()) {
                user.isPassChangeAllowed = true;
                user.save();
                return sendResponse(res, 200, "Sucess", "Authorized to change pass");
            } else {
                return sendResponse(res, 401, "Expired", "Expirated code, ask another");
            }
        } else {
            return sendResponse(res, 401, code, "Wrong code!");
        }
    } catch (err) {
        return sendResponse(res, 400, err.name, err.message);
    }
};