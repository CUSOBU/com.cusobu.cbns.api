import express, { Application, Request, Response, NextFunction } from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { config } from './config/config';
import Logging from './library/Logging';
import userRoutes from './routes/User';
import remittanceRoutes from './routes/Remittance';
import walakRoutes from './routes/Walak';
import balanceRoutes from './routes/Balance';
import authRoutes from './routes/auth';
import statisticsRoutes from './routes/Statistics';
import ProviderBalanceRoutes from './routes/ProviderBalance';
import TopupRoutes from './routes/Topup';
import TopupOrderRoutes from './routes/TopupOrder';
import ConfigurationRoutes from './routes/Configuration';
import passportStrategy from './config/passport';
import passport from 'passport';



const app: Application = express();

passportStrategy(passport);
// app.use(passport.initialize());

/**
 * Mongo connect
 * */

mongoose
    .connect(config.mongo.url, { retryWrites: true, w: 'majority' })
    .then(() => {
        Logging.info('Mongo Atlas connected');
        StartServer();
    })
    .catch((error) => {
        Logging.error('Unable to connect');
        Logging.error(error);
    });

const startTest = () => {
    mongoose
        .connect(config.mongo.url, { retryWrites: true, w: 'majority' })
        .then(() => {
            Logging.info('Mongo Atlas connected');
            app.use(express.urlencoded({ extended: true }));
            app.use(express.json());
            app.use('/users', userRoutes);
            app.use('/remittances', remittanceRoutes);

            /** HealthCheck */
            app.get('/health-check', (req: Request, res: Response, next: NextFunction) => res.status(200).json({ message: 'OK' }));

            /** Error handling */
            app.use((req: Request, res: Response, next: NextFunction) => {
                const error = new Error('not found');
                Logging.error(error);

                return res.status(404).json({ message: error.message });
            });
            return app;
        })
        .catch((error) => {
            Logging.error('Unable to connect');
            Logging.error(error);
        });
};

const StartServer = () => {
    app.use((req: Request, res: Response, next: NextFunction) => {
        /** Log the Request */
        Logging.info(`Incomming => Method: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);

        res.on('finish', () => {
            /** Log the Response */
            Logging.info(`Incomming => Method: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}] - STATUS: [${res.statusCode}]`);
        });

        next();
    });

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    /** Rules of our API */
    app.use((req: Request, res: Response, next: NextFunction) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

        if (req.method == 'OPTIONS') {
            res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
            return res.status(200).json({});
        }

        next();
    });

    /** Routes */
    app.use('/users', userRoutes);
    app.use('/remittances', remittanceRoutes);
    app.use('/walak', walakRoutes);
    app.use('/balances', balanceRoutes);
    app.use('/providerbalances', ProviderBalanceRoutes);
    app.use('/', authRoutes);
    app.use('/login', authRoutes);
    app.use('/statistics', statisticsRoutes);
    app.use('/topups', TopupRoutes);
    app.use('/topuporders', TopupOrderRoutes);
    app.use('/configs', ConfigurationRoutes)

    /** HealthCheck */
    app.get('/health', (req: Request, res: Response, next: NextFunction) => res.status(200).json({ message: 'OK :)' }));

    /** Error handling */
    app.use((req: Request, res: Response, next: NextFunction) => {
        const error = new Error('not found');
        Logging.error(error);

        return res.status(404).json({ message: error.message });
    });

    http.createServer(app).listen(config.server.port, () => {
        Logging.info(`Server is running on port ${config.server.port}`);
    });
};

export default { app, startTest };
