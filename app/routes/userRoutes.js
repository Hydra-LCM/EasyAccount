import express from 'express';
import * as userController from "../controllers/users/userController.js";
import authenticateToken from '../middleware/authenticate.js';

const router = express.Router();

router.post('/register', userController.registerController);
router.post('/confirmemail', userController.confirmEmailController);
router.post('/passrecovery', userController.sendPassRecovery);
router.post('/confirmpassrecovery', userController.confirmRecoveryPassCode);
router.post('/user/recoverypass', userController.userRecoveryPass);
router.get('/resendcode', authenticateToken, userController.resendConfirmationCodeController);

export default router;