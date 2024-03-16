import sendResponse  from "../utils/response.js";
import * as authService from "../services/authService.js";

export const loginController = async (req, res) => {
    try {
        const { statusCode, data, message } = await authService.login(req);
        sendResponse(res, statusCode, data, message);
    } catch (error) {
        sendResponse(res, error.statusCode, error.name, error.message);
    }
};

export const logoutController = async (req, res) => {
    try {
        const { statusCode, data, message } = await authService.logout(req.headers.authorization);
        sendResponse(res, statusCode, data, message);
    } catch (error) {
        sendResponse(res, error.statusCode, error.name, error.message);
    }
};
