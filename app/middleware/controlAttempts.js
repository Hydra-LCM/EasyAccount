import ConfirmationAttempt from '../models/userConfirmationAttempt.js';
import dotenv from 'dotenv';

dotenv.config();

export const controlAttemptsMiddleware = async (req) => {
    const limitAttempts = process.env.LIMIT_ATTEMPTS;
    const timeAttempts = process.env.TIME_ATTEMPTS;
    const action = req.action;
    await ConfirmationAttempt.create({ username: req.body.username, action });
    const attempts = await ConfirmationAttempt.find({ username: req.body.username, action }).sort({ timestamp: -1 }).limit(limitAttempts);

    if (attempts.length >= limitAttempts) {
        const lastAttemptTime = attempts[0].timestamp.getTime();
        const prevAttemptTime = attempts[1].timestamp.getTime();
        const timeDiffInSeconds = Math.floor((lastAttemptTime - prevAttemptTime) / 1000);

        if (timeDiffInSeconds < timeAttempts) {
            return { statuscode: 400, data: `Too many attempts for ${action}`, message: `Please wait ${timeAttempts - timeDiffInSeconds} seconds before attempting again.` };
        }
    }

    return { data: false };
};
