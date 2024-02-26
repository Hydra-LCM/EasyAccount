import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import md5 from "md5";
import generateTokenAndPersonalKey from "../middleware/generateToken.js";
import { sendResponse } from "../utils/response.js";
import { sendConfirmationEmail } from '../utils/email.js';
import { generateCode as generateVerificationCode } from "../utils/generateCode.js";


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
        const confirmationReturn = await sendConfirmationEmail(savedUser);
        console.log(savedUser);
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
        const user = await User.findOne({ username: req.body.username, password: req.body.password }).select('-password');
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

    const code = req.body.code;
    const token = req.headers.authorization;
    const decodedToken = jwt.decode(token, { complete: true });
    try {
        const user = await User.findById(decodedToken.payload.id).select('-password');
        if(user.confirmationCode == code){
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

        user.confirmationCode = generateVerificationCode(); // Gerar um novo código de confirmação
        await user.save();
        delete user.password;
        console.log(user);
        await sendConfirmationEmail(user);
        return sendResponse(res, 200, user, "Confirmation code resent successfully");
    } catch (err) {
        return sendResponse(res, 400, err.name, err.message);
    }
};