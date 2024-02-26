import express from 'express';
import * as authController from "../controllers/authController.js";
import authenticateToken from '../middleware/authenticate.js';

const router = express.Router();

router.post('/login', authController.loginController);
router.post('/register', authController.registerController);
router.get('/logout', authenticateToken, authController.logoutController);
router.get('/confirm', authenticateToken, authController.confirmEmailController);
router.get('/resendcode', authenticateToken, authController.resendConfirmationCodeController);

export default router;
