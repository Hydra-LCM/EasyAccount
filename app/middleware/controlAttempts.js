import ConfirmationAttempt from '../models/userConfirmationAttempt.js';

export const controlAttemptsMiddleware = async (req) => {

    const action = req.action;
    await ConfirmationAttempt.create({ username: req.body.username, action: action });
    const attempts = await ConfirmationAttempt.find({ username: req.body.username, action }).sort({ timestamp: -1 }).limit(5);

    if (attempts.length >= 5) {
        const lastAttemptTime = attempts[0].timestamp.getTime();
        const prevAttemptTime = attempts[1].timestamp.getTime();
        const timeDiffInSeconds = Math.floor((lastAttemptTime - prevAttemptTime) / 1000);

        if (timeDiffInSeconds < 30) {
            return {statuscode: 400, data: `Too many attempts for ${action}`, message: `Please wait ${30 - timeDiffInSeconds} seconds before attempting again.`};
        } 
    } 

    return {data: false};

};
