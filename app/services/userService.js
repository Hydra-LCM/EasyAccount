import User from "../models/userModel.js";
import md5 from "md5";
import sendEmail from '../utils/email.js';
import generateCode from "../utils/generateCode.js";
import { confirmationTemplate } from "../assets/emails/emailsTemplate.js";
import controlAttemptsMiddleware from '../middleware/controlAttempts.js'
import { recoveryPassTemplate } from "../assets/emails/emailsTemplate.js";
import { securityQuestions } from "../utils/securityQuestions.js";

export const userRegister = async (username, password) => {
    const passwordMd5 = md5(password);
    const code = generateCode();

    const newUser = new User({
        username: username,
        password: passwordMd5,
        confirmationCode: code,       
    });

    const foundUser = await User.findOne({ username: username });
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
        if (user.isConfirmationCodeRecent()) {
            user.isActive = true;
            await user.save();
            return { statusCode: 200, data: null, message: "Email confirmed successfully!"}
        } else {
            return { statusCode: 410, data: "Expired", message: "Expirated code, ask for another"}
        }
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

export const getSecurityQuestions = async (language) => {
    const questionsInSelectedLanguage = securityQuestions.map(obj => ({
        id: obj.id,
        question: obj.question[language]
    }));
    if(!questionsInSelectedLanguage){
        return { statusCode: 404, data: null, message: "Questions not found, check language!" }
    }
    return { statusCode: 200, data: questionsInSelectedLanguage, message: "Questions" }
};

export const addSecurityQuestions = async (questionID, answer, username ) => {
    const user = await User.findOne({ username: username }).select('-password');
    const data = user.addSecurityQuestion(questionID, answer.toLowerCase());
    user.save();
    return { statusCode: 200, data: data, message: "Question added" }
};

export const addSecurityEmail = async ( email, username ) => {
    const code = generateCode();
    const user = await User.findOne({ username: username }).select('-password');
    const existUserEmail = await User.findOne({ username: email }).select('-password');
    if(existUserEmail) {
        return { statusCode: 409, data: "Conflict", message: "Email already used!" }
    }
    user.confirmationCode = code;
    const confirmationReturn = await sendEmail(savedUser, "Código de Confirmação - HYDRA", confirmationTemplate);
    user.secondaryEmail = email;
    return { statusCode: 200, data: confirmationReturn, message: "Security Email updated" }
};

export const checkSecurityQuestionAnswer = async (questionID, answer, username ) => {
    const lowerAnswer = answer.toLowerCase();
    const user = await User.findOne({ username: username }).select('-password');
    if(!user) return { statusCode: 404, data: "User not found!", message: "User not found!" }
    if (user.isEmailChangeAllowed) {
        return { statusCode: 409, data: "Conflict", message: "User is already allowed to change email"}
    }
    const action = 'checkQuestionAnswer';
    const attempts = await controlAttemptsMiddleware(username, action);
    if (attempts.data) {
        return { statusCode: 429, data: attempts.data, message: attempts.message}
    } 
    const allowed = user.checkSecurityAnswer(questionID, lowerAnswer);
    if (allowed) {
        user.isEmailChangeAllowed = true;
        user.save();
    }
    return { statusCode: 200, data: allowed, message: "Question correct, allowed to change email" }
};

export const userRecoveryEmailBySecurityQuestion = async ( email, confirmEmail, username ) => {
    const user = await User.findOne({ username: username }).select('-password');
    if (user) {
        if (user.isEmailChangeAllowed) {
            if(email != confirmEmail) {
                return { statusCode: 401, data: "Unauthenticated", message: "Emails didnt match!"}
            }

            const existUserEmail = await User.findOne({ username: email }).select('-password');
            if(existUserEmail){
                return { statusCode: 409, data: "Conflict", message: "Email already used!" }
            }

            user.username = email;
            user.isEmailChangeAllowed = false;
            user.isActive = false;
            user.confirmationCode = generateCode();
            await sendEmail(user, "Código de Confirmação - HYDRA", confirmationTemplate);
            user.save();
            return { statusCode: 200, data: "Sucess", message: "Email changed, please confirm your new email" }
        } else {
            return { statusCode: 403, data: "Unauthorized", message: "User not allowed to change Email" }
        }
    } else {
        return { statusCode: 404, data: "User not found!", message: "User not found!" }
    }

};


export const confirmSecondEmail = async (email, code) => {

    const user = await User.findOne({ secondaryEmail: email, confirmationCode: code });

    const action = 'confirmationSecondEmail';
    const attempts = await controlAttemptsMiddleware(user.username, action);
    if (attempts.data) {
        return { statusCode: 429, data: attempts.data, message: attempts.message }
    }
    
    if (user) {
        if (user.isConfirmationCodeRecent()) {
            user.isSecondaryEmailConfirmed = true;
            await user.save();
            return { statusCode: 200, data: null, message: "Second email confirmed successfully!"}
        } else {
            return { statusCode: 410, data: "Expired", message: "Expirated code, ask for another"}
        }
    } else {
        return { statusCode: 404, data: code, message: "Wrong code!"}
    }
};