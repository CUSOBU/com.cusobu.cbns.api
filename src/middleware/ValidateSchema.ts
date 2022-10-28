import joi, { ObjectSchema } from 'joi';
import { Response, Request, NextFunction } from 'express';
import Logging from '../library/Logging';
import IUser from '../interfaces/user';
import { IWallet } from '../models/Wallet';

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
            name: joi.string().required()
        }),
        update: joi.object<IUser>({
            name: joi.string().required()
        })
    },
    wallet: {
        create: joi.object<IWallet>({
            name: joi.string().required(),
            user: joi
                .string()
                .regex(/^[0-9a-fA-F]{24}$/)
                .required()
        }),
        update: joi.object<IWallet>({
            name: joi.string().required(),
            user: joi.string().regex(/^[0-9a-fA-F]{24}$/)
        })
    }
};
