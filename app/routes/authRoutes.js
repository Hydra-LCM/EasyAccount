import express from 'express';
import * as authController from "../controllers/authController.js";
import authenticateToken from '../middleware/authenticate.js';

const router = express.Router();

router.post('/login', authController.loginController);
router.post('/register', authController.registerController);

router.use(authenticateToken);

router.get('/logout', authController.logoutController);
router.post('/confirm', authController.confirmEmailController);
router.get('/resendcode', authController.resendConfirmationCodeController);

export default router;
