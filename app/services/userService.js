import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import md5 from "md5";
import { sendResponse } from "../utils/response.js";
import sendEmail from '../utils/email.js';
import { generateCode as generateVerificationCode } from "../utils/generateCode.js";
import { confirmationTemplate } from "../assets/emails/emailsTemplate.js";
import { controlAttemptsMiddleware } from '../middleware/controlAttempts.js'
import { recoveryPassTemplate } from "../assets/emails/emailsTemplate.js";

export const userRegister = async (req) => {
    req.body.password = md5(req.body.password);
    const code = generateVerificationCode();

    const newUser = new User({
        username: req.body.username,
        password: req.body.password,
        role: req.body.role,
        confirmationCode: code,       
    });

    const foundUser = await User.findOne({ username: req.body.username, password: req.body.password });
    if (foundUser) {
        return { statusCode: 409, data: "Conflict", message: "Email already exists" }
    }
    let savedUser = await newUser.save();
    const confirmationReturn = await sendEmail(savedUser, "Código de Confirmação - HYDRA", confirmationTemplate);

    if (confirmationReturn.data) {
        return { statusCode: 200, data: confirmationReturn.data, message: "User registered successfully" }
    } else {
        return { statusCode: 400, data: "EmailError", message: confirmationReturn.message }
    }

};

export const confirmEmail = async (req) => {
    const code = req.body.code;

    req.action = 'confirmationEmail';
    const attempts = await controlAttemptsMiddleware(req);
    if (attempts.data) {
        return { statusCode: 429, data: attempts.data, message: attempts.message }
    }

    const user = await User.findOne({ username: req.body.username, confirmationCode: code });
    if (user) {
        user.isActive = true;
        await user.save();
        return { statusCode: 200, data: null, message: "Email confirmed successfully!"}
    } else {
        return { statusCode: 404, data: code, message: "Wrong code!"}
    }

};

export const resendConfirmationCode = async (req) => {

    const authHeader = req.headers.authorization;
    const parts = authHeader.split(' ');
    const token = parts[1];
    const decodedToken = jwt.decode(token, { complete: true });
    const user = await User.findById(decodedToken.payload.id).select('-password');

    if (user.isActive) {
        return { statusCode: 409, data: "Conflict", message: "User is already active"}
    }

    req.action = 'resend';
    const attempts = await controlAttemptsMiddleware(req);
    if (attempts.data) {
        return { statusCode: 429, data: attempts.data, message: attempts.message}
    }

    user.confirmationCode = generateVerificationCode();
    await user.save();
    await sendConfirmationEmail(user);
    return { statusCode: 200, data: user, message: "Confirmation code resent successfully"}

};

export const sendPassRecovery = async (req) => {
    const code = generateVerificationCode();

    const foundUser = await User.findOne({ username: req.body.username }).select('-password');
    if (!foundUser) {
        return { statusCode: 404, data: "Email not found", message: "Email is not registered!"}
    }

    req.action = 'resendRecovery';
    const attempts = await controlAttemptsMiddleware(req);
    if (attempts.data) {
        return { statusCode: 429, data: attempts.data, message: attempts.message}
    }

    foundUser.recoveryCode = code;
    await foundUser.save();
    const confirmationReturn = await sendEmail(foundUser, "Código de recuperação de senha - HYDRA", recoveryPassTemplate);

    if (confirmationReturn.data) {
        return { statusCode: 200, data: confirmationReturn.data, message: "Recovery Pass Email sended"}
    } else {
        return { statusCode: 400, data: "EmailError", message: confirmationReturn.message}
    }

};

export const confirmRecoveryPassCode = async (req) => {
    const code = req.body.code;

    req.action = 'confirmationPassRecovery';
    const attempts = await controlAttemptsMiddleware(req);
    if (attempts.data) {
        return { statusCode: 429, data: attempts.data, message: attempts.message}
    }

    const user = await User.findOne({ username: req.body.username, recoveryCode: code }).select('-password');
    if (user) {
        if (user.isRecoveryCodeRecent()) {
            user.isPassChangeAllowed = true;
            user.save();
            return { statusCode: 200, data: "Sucess", message: "Authorized to change pass"}
        } else {
            return { statusCode: 410, data: "Expired", message: "Expirated code, ask for another"}
        }
    } else {
        return { statusCode: 404, data: code, message: "Wrong code!"}
    }

};

export const userRecoveryPass = async (req) => {

    const user = await User.findOne({ username: req.body.username }).select('-password');
    if (user) {
        if (user.isPassChangeAllowed) {
            const password1 = req.body.password;
            const password2 = req.body.confirmpassword;
        
            if(password1 != password2) {
                return { statusCode: 401, data: "Unauthenticated", message: "Passwords didnt match!"}
            }
            user.password = md5(password1);
            user.isPassChangeAllowed = false;
            user.save();
            return { statusCode: 200, data: "Sucess", message: "Pass changed" }
        } else {
            return { statusCode: 403, data: "Unauthorized", message: "User not allowed to change pass" }
        }
    } else {
        return { statusCode: 404, data: "User not found!", message: "User not found!" }
    }

};