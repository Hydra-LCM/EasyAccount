import { connect } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectToDatabase = () => {
    const dbUrl = process.env.DATABASE_URL;
    return connect(dbUrl);
};

export default connectToDatabase;
