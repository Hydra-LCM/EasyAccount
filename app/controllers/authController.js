import sendResponse  from "../utils/response.js";
import * as authService from "../services/authService.js";

export const loginController = async (req, res) => {
    const { username, password } = req.body;
    try {
        const { statusCode, data, message } = await authService.login(username, password);
        sendResponse(res, statusCode, data, message);
    } catch (error) {
        sendResponse(res, 500, error.name, error.message);
    }
};

export const logoutController = async (req, res) => {
    const authorization = req.headers.authorization;
    try {
        const { statusCode, data, message } = await authService.logout(authorization);
        sendResponse(res, statusCode, data, message);
    } catch (error) {
        sendResponse(res, 500, error.name, error.message);
    }
};
