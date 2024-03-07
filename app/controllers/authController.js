import * as authService from '../services/authService.js';

export const loginController = async (req, res) => {
    authService.login(req, res);
};

export const logoutController = async (req, res) => {
    authService.logout(req, res);
};
