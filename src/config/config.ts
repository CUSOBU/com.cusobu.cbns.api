import dotenv from 'dotenv';

dotenv.config();

const MONGO_USERNAME = process.env.MONGO_USERNAME || '';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || '';
const MONGO_URL =  `mongodb+srv://cubanitos:Cuba901208@cluster0.djq68l7.mongodb.net/cubanitos`;
const SECRET_KEY = process.env.SECRET_KEY || 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3';
const WEB_URL = process.env.WEB_URL || 'http://localhost:1130';
const SALT_ROUNDS = process.env.SALT_ROUNDS || 10;
const WALAK_API_URL = process.env.WALAK_API_URL || 'https://api.dev.walak.app/api/mlc';
const WALAK_API_KEY = process.env.WALAK_API_KEY || 'yVasDgAmcnbkiquign0XdvrehxdAPhPPf6R5jC9M8tDbN8B0PmOamVV7x7OnUGBgkC1c0+wIsd1r6UJk7+L54oXH6OXay1maBimxOs4oQz3mNNn4McKIr9VX6H64Y1dNKQ4WpA==';
const UYU_EXCHANGE = process.env.UYU_EXCHANGE || 40;
const CUP_EXCHANGE = process.env.CUP_EXCHANGE || 185;

const SERVER_PORT = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 1130;

export const config = {
    mongo: {
        url: MONGO_URL
    },
    server: {
        port: SERVER_PORT
    },
    SECRET_KEY: SECRET_KEY,
    SALT_ROUNDS: Number(SALT_ROUNDS),
    URL: WEB_URL,
    UYU_EXCHANGE: Number(UYU_EXCHANGE),
    CUP_EXCHANGE: Number(CUP_EXCHANGE),
};

