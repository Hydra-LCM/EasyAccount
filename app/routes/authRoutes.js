import express from 'express';
import * as authController from "../controllers/authController.js";
import authenticateToken from '../middleware/authenticate.js';
import { validateEmailInput } from '../middleware/validator.js';

const router = express.Router();

router.post('/login', validateEmailInput, authController.loginController);
router.get('/logout', authenticateToken, authController.logoutController);

export default router;
