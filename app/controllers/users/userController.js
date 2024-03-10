import * as userService from '../../services/userService.js';
import { sendResponse } from "../../utils/response.js";

export const registerController = async (req, res) => {
    try{
        const { statusCode, data, message } = await userService.userRegister(req);
        sendResponse(res, statusCode, data, message);
    } catch (error) {
        sendResponse(res, error.statusCode, error.name, error.message);
    }
    
};

export const confirmEmailController = async (req, res) => {
    try{
        const { statusCode, data, message } = await userService.confirmEmail(req);
        sendResponse(res, statusCode, data, message);
    } catch (error) {
        sendResponse(res, error.statusCode, error.name, error.message);
    }
};

export const resendConfirmationCodeController = async (req, res) => {
    try{
        const { statusCode, data, message } = await userService.resendConfirmationCode(req);
        sendResponse(res, statusCode, data, message);
    } catch (error) {
        sendResponse(res, error.statusCode, error.name, error.message);
    }
};

export const sendPassRecovery = async (req, res) => {
    try{
        const { statusCode, data, message } = await userService.sendPassRecovery(req);
        sendResponse(res, statusCode, data, message);
    } catch (error) {
        sendResponse(res, error.statusCode, error.name, error.message);
    }
};

export const confirmRecoveryPassCode = async (req, res) => {
    try{
        const { statusCode, data, message } = await userService.confirmRecoveryPassCode(req);
        sendResponse(res, statusCode, data, message);
    } catch (error) {
        sendResponse(res, error.statusCode, error.name, error.message);
    }
};

export const userRecoveryPass = async (req, res) => {
    userService.userRecoveryPass(req, res);
};