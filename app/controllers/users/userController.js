import * as userService from '../../services/userService.js';
import sendResponse  from "../../utils/response.js";

export const registerController = async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const { statusCode, data, message } = await userService.userRegister(username, password, role);
        sendResponse(res, statusCode, data, message);
    } catch (error) {
        sendResponse(res, 400, error.name, error.message);
    }

};

export const confirmEmailController = async (req, res) => {
    const { username, code } = req.body;
    try {
        const { statusCode, data, message } = await userService.confirmEmail(username, code);
        sendResponse(res, statusCode, data, message);
    } catch (error) {
        sendResponse(res, 400, error.name, error.message);
    }
};

export const resendConfirmationCodeController = async (req, res) => {
    const { username } = req.body;
    try {
        const { statusCode, data, message } = await userService.resendConfirmationCode(username);
        sendResponse(res, statusCode, data, message);
    } catch (error) {
        sendResponse(res, 400, error.name, error.message);
    }
};

export const sendPassRecovery = async (req, res) => {
    const { username } = req.body;
    try {
        const { statusCode, data, message } = await userService.sendPassRecovery(username);
        sendResponse(res, statusCode, data, message);
    } catch (error) {
        sendResponse(res, 400, error.name, error.message);
    }
};

export const confirmRecoveryPassCode = async (req, res) => {
    const { code, username } = req.body;
    try {
        const { statusCode, data, message } = await userService.confirmRecoveryPassCode(code, username);
        sendResponse(res, statusCode, data, message);
    } catch (error) {
        sendResponse(res, 400, error.name, error.message);
    }
};

export const userRecoveryPass = async (req, res) => {
    const { password, confirmpassword, username } = req.body;
    try {
        const { statusCode, data, message } = await userService.userRecoveryPass(password, confirmpassword, username );
        sendResponse(res, statusCode, data, message);
    } catch (error) {
        sendResponse(res, 400, error.name, error.message);
    }
};