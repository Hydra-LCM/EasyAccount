import cron from 'node-cron';
import ConfirmationAttemptSchema from '../app/models/userConfirmationAttempt.js'

export const configureCronJob = () => {
    cron.schedule('*/60 * * * *', async () => {
        try {
            await ConfirmationAttemptSchema.deleteMany({});
            console.log(`Data in 'ConfirmationAttempt' collection deleted successfully.`);
        } catch (error) {
            console.error(`Error deleting data from 'ConfirmationAttempt' collection:`, error);
        }
    });
};