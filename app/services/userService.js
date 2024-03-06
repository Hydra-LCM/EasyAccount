import User from "../models/userModel.js";
import md5 from "md5";
import { sendResponse } from "../utils/response.js";
import sendEmail from '../utils/email.js';
import { generateCode as generateVerificationCode } from "../utils/generateCode.js";
import { confirmationTemplate } from "../assets/emails/emailsTemplate.js";

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