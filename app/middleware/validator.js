import { sendResponse } from '../utils/response.js';

export const validateEmailInput = (req, res, next) => {
    const { username } = req.body;
    
    if (!username || username.trim() === '') {
        return sendResponse(res, 400, username, "Email is required");
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
        return sendResponse(res, 400, username, "Email is not valid ");
    }

    next();
};
