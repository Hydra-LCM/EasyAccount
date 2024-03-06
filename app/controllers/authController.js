import * as userService from '../services/userService.js';
import * as authService from '../services/authService.js';

export const registerController = async (req, res) => {
    userService.userRegister(req, res);
};

export const loginController = async (req, res) => {
    authService.login(req, res);
};

export const logoutController = async (req, res) => {
    authService.logout(req, res);
};

export const confirmEmailController = async (req, res) => {
    authService.confirmEmail(req, res);
};

export const resendConfirmationCodeController = async (req, res) => {
    authService.resendConfirmationCode(req, res);
};

export const sendPassRecovery = async (req, res) => {
    authService.sendPassRecovery(req, res);
};

export const confirmRecoveryPassCode = async (req, res) => {
    authService.confirmRecoveryPassCode(req, res);
};

export const userRecoveryPass = async (req, res) => {
    userService.userRecoveryPass(req, res);
};
