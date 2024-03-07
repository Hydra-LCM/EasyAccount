import * as userService from '../../services/userService.js';

export const registerController = async (req, res) => {
    userService.userRegister(req, res);
};

export const confirmEmailController = async (req, res) => {
    userService.confirmEmail(req, res);
};

export const resendConfirmationCodeController = async (req, res) => {
    userService.resendConfirmationCode(req, res);
};

export const sendPassRecovery = async (req, res) => {
    userService.sendPassRecovery(req, res);
};

export const confirmRecoveryPassCode = async (req, res) => {
    userService.confirmRecoveryPassCode(req, res);
};

export const userRecoveryPass = async (req, res) => {
    userService.userRecoveryPass(req, res);
};