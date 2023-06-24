import joi, { ObjectSchema } from 'joi';
import { Response, Request, NextFunction } from 'express';
import Logging from '../library/Logging';
import IUser from '../interfaces/user';
import IRemittance from '@src/interfaces/remittance';
import { IRemittanceModel } from '@src/models/Remittance';

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
            email: joi.string().required().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] }}),
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
    }
};
