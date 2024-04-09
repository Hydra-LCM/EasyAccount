import express from 'express';
import * as userController from "../controllers/users/userController.js";
import authenticateToken from '../middleware/authenticate.js';
import { validateEmailInput } from '../middleware/validator.js';

const router = express.Router();

router.post('/register', validateEmailInput, userController.registerController);
router.post('/confirmemail', userController.confirmEmailController);
router.post('/passrecovery', userController.sendPassRecovery);
router.post('/confirmpassrecovery', userController.confirmRecoveryPassCode);
router.post('/user/recoverypass', userController.userRecoveryPass);
router.post('/user/recoverEmail', userController.userRecoveryEmail);
router.post('/resendcode', userController.resendConfirmationCodeController);
router.post('/security-questions/check', userController.checkSecurityQuestionAnswer);
router.post('/security-questions/get', userController.getSecurityQuestions);
router.post('/security-questions', userController.addSecurityQuestions);

export default router;