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
router.post('/resendcode', userController.resendConfirmationCodeController);

export default router;