import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import md5 from "md5";
import sendEmail from '../utils/email.js';
import generateCode from "../utils/generateCode.js";
import { confirmationTemplate } from "../assets/emails/emailsTemplate.js";
import controlAttemptsMiddleware from '../middleware/controlAttempts.js'
import { recoveryPassTemplate } from "../assets/emails/emailsTemplate.js";

export const userRegister = async (username, password, role) => {
    const passwordMd5 = md5(password);
    const code = generateCode();

    const newUser = new User({
        username: username,
        password: passwordMd5,
        role: role,
        confirmationCode: code,       
    });

    const foundUser = await User.findOne({ username: username, password: passwordMd5 });
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

export const confirmEmail = async (username, code) => {
    const action = 'confirmationEmail';
    const attempts = await controlAttemptsMiddleware(username, action);
    if (attempts.data) {
        return { statusCode: 429, data: attempts.data, message: attempts.message }
    }
    const user = await User.findOne({ username: username, confirmationCode: code });
    if (user) {
        user.isActive = true;
        await user.save();
        return { statusCode: 200, data: null, message: "Email confirmed successfully!"}
    } else {
        return { statusCode: 404, data: code, message: "Wrong code!"}
    }

};

export const resendConfirmationCode = async (username) => {

    const foundUser = await User.findOne({ username: username }).select('-password');

    if (foundUser.isActive) {
        return { statusCode: 409, data: "Conflict", message: "User is already active"}
    }

    const action = 'resend';
    const attempts = await controlAttemptsMiddleware(foundUser.username, action);
    if (attempts.data) {
        return { statusCode: 429, data: attempts.data, message: attempts.message}
    }

    foundUser.confirmationCode = generateCode();
    await foundUser.save();
    await sendEmail(foundUser, "Código de Confirmação - HYDRA", confirmationTemplate);
    return { statusCode: 200, data: "", message: "Confirmation code resent successfully"}

};

export const sendPassRecovery = async (username) => {
    const code = generateCode();

    const foundUser = await User.findOne({ username: username }).select('-password');
    if (!foundUser) {
        return { statusCode: 404, data: "Email not found", message: "Email is not registered!"}
    }

    const action = 'resendRecovery';
    const attempts = await controlAttemptsMiddleware(username, action);
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

export const confirmRecoveryPassCode = async (code, username) => {

    const action = 'confirmationPassRecovery';
    const attempts = await controlAttemptsMiddleware(username, action);

    if (attempts.data) {
        return { statusCode: 429, data: attempts.data, message: attempts.message}
    }

    const user = await User.findOne({ username: username, recoveryCode: code }).select('-password');
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

export const userRecoveryPass = async (password, confirmpassword, username ) => {

    const user = await User.findOne({ username: username }).select('-password');
    if (user) {
        if (user.isPassChangeAllowed) {
            const password1 = password;
            const password2 = confirmpassword;
        
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