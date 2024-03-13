import express from "express";
import { connectToDatabase } from './db.js';
import dotenv from 'dotenv';
import { configureCronJob } from "./jobs.js";
import swaggerUI from 'swagger-ui-express';
import userRoutes from "../app/routes/userRoutes.js";
import authRoutes from "../app/routes/authRoutes.js";
import { processSwaggerDocuments } from "./swagger.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

export const startServer = async () => {
    await connectToDatabase();
    configureCronJob();

    if (process.env.NODE_ENV === 'dev') {
        const { baseSwaggerDocument, aggregatedPaths } = processSwaggerDocuments();
        const aggregatedSwaggerDocs = {
            ...baseSwaggerDocument,
            paths: aggregatedPaths
        };
        
        app.use('/api-docs', swaggerUI.serve, (req, res, next) => {
            swaggerUI.setup(aggregatedSwaggerDocs)(req, res, next);
        });
    }

    app.use(express.urlencoded({ extended: true }));
    app.use(express.static('public'));
    app.use('/', authRoutes);
    app.use('/', userRoutes);

    app.listen(port, () => {
        console.log(`Server started on port ${port}`);
    });
};