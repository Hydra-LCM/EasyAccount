import express from "express";
import { connectToDatabase } from './db.js';
import dotenv from 'dotenv';
import { configureCronJob } from "./jobs.js";

import userRoutes from "../app/routes/userRoutes.js";
import authRoutes from "../app/routes/authRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT;

//a middleware to parse URL-encoded data.
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/', authRoutes);

export const startServer = async () => {

    await connectToDatabase();
    
    configureCronJob();

    app.listen(port, () => {
        console.log(`Server started on port ${port}`);
    });
};
