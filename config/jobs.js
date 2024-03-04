import cron from 'node-cron';
import ConfirmationAttemptSchema from '../app/models/userConfirmationAttempt.js'
import dotenv from 'dotenv';

dotenv.config();
export const configureCronJob = () => {
    const crontime = process.env.CRON_TIME
    const cronSchedule = `*/${crontime} * * * *`; // Constructing the cron schedule string
    cron.schedule(cronSchedule, async () => {
        try {
            await ConfirmationAttemptSchema.deleteMany({});
            console.log(`Data in 'ConfirmationAttempt' collection deleted successfully.`);
        } catch (error) {
            console.error(`Error deleting data from 'ConfirmationAttempt' collection:`, error);
        }
    });
};