import express from 'express';

const router = express.Router();

router.post('/', (req, res) => { console.log('ok ne'); });

export default router;
