import { connect } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectToDatabase = () => {
    const dbUrl = process.env.DATABASE_URL;
    return connect(dbUrl);
};
