import express from 'express';
import * as authController from '../controllers/authController.js';
import authenticateToken from '../middleware/authenticate.js';

const router = express.Router();

router.post('/login', authController.loginController);
router.post('/register', authController.registerController);
router.post('/confirmemail', authController.confirmEmailController);
router.post('/passrecovery', authController.sendPassRecovery);
router.post('/confirmpassrecovery', authController.confirmRecoveryPassCode);
router.post('/user/recoverypass', authController.userRecoveryPass);

router.use(authenticateToken);

router.get('/logout', authController.logoutController);
router.get('/resendcode', authController.resendConfirmationCodeController);

export default router;
