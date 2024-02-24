import express from 'express';
import authenticateToken from '../middleware/authenticate.js';

const router = express.Router();

router.post('/', (req, res) => {console.log("ok ne")});

export default router;