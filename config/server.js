import express from "express";
import { connectToDatabase } from './db.js';
import dotenv from 'dotenv';
import { configureCronJob } from "./jobs.js";
import swaggerUI from 'swagger-ui-express';
import userRoutes from "../app/routes/userRoutes.js";
import authRoutes from "../app/routes/authRoutes.js";
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

if (process.env.NODE_ENV === 'dev') {
    const swaggerDocumentPath = path.join('', './swagger.json');
    const swaggerDocument = JSON.parse(fs.readFileSync(swaggerDocumentPath, { encoding: 'utf8' }));

    app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));
}

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/', authRoutes);
app.use('/', userRoutes);

export const startServer = async () => {
    await connectToDatabase();
    configureCronJob();
    app.listen(port, () => {
        console.log(`Server started on port ${port}`);
    });
};
