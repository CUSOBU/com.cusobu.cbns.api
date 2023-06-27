import dotenv from 'dotenv';

dotenv.config();

const MONGO_USERNAME = process.env.MONGO_USERNAME || '';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || '';
const MONGO_URL =  `mongodb+srv://cubanitos:Cuba901208@cluster0.djq68l7.mongodb.net/cubanitos`;

const SERVER_PORT = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 1130;

export const config = {
    mongo: {
        url: MONGO_URL
    },
    server: {
        port: SERVER_PORT
    },
    SECRET_KEY: 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3',
    SALT_ROUNDS: 10,
    URL: 'http://localhost:1130',
    uyu_exchange_rate: 40,
    cup_exchange_rate: 185
};

