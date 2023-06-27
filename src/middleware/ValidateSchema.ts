import joi, { ObjectSchema } from 'joi';
import { Response, Request, NextFunction } from 'express';
import Logging from '../library/Logging';
import IUser from '../interfaces/user';
import IRemittance from '@src/interfaces/remittance';
import { IRemittanceModel } from '@src/models/Remittance';
import IBalance from '@src/interfaces/balance';
import { IUserBalance } from '../models/Balance';

export const ValidateSchema = (schema: ObjectSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.validateAsync(req.body);

            next();
        } catch (error) {
            Logging.error(error);
            res.status(422).json({ error });
        }
    };
};

export const Schemas = {
    user: {
        create: joi.object<IUser>({
            name: joi.string().required(),
            email: joi.string().required().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'uy'] }}),
            password: joi.string().required()
        }),
        update: joi.object<IUser>({
            name: joi.string().required()
        })
    },
    remittance: {
        create: joi.object<IRemittance>({
            user_email: joi.string().required(),
            cardNumber: joi.string().required(),
            full_name: joi.string(),
            phone_number: joi.string(),
            amount: joi.number().required(),
            currency: joi.string().required(),
            budget: joi.number().required(),
            budget_currency: joi.string().required()
        }),
        update: joi.object<IRemittance>({
            process_status: joi.string(),
            source_reference: joi.string()
        })
    },
    balance: {
        create: joi.object<IUserBalance>({
            email: joi.string().required().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'uy'] }}),
            operational_price: joi.number(),
            customer_price: joi.number(),
            balance_usd: joi.number(),
            balance_uyu: joi.number(),
            operational_limit: joi.number(),
            pre_paid: joi.boolean(),
            allow_overlimit: joi.boolean(),
            last_update: joi.date()
        }),
        update: joi.object<IUserBalance>({
            email: joi.string().required().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'uy'] }}),
            operational_price: joi.number(),
            customer_price: joi.number(),
            balance_usd: joi.number(),
            balance_uyu: joi.number(),
            operational_limit: joi.number(),
            pre_paid: joi.boolean(),
            allow_overlimit: joi.boolean(),
            last_update: joi.date()
        })
    }
};
