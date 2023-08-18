import { Response, Request, NextFunction } from 'express';
import Balance, { IBalance } from '../models/Balance';
import User from '../models/User';
import { config } from '../config/config';
import BalanceServices from "../services/Balance";


import Configuration  from '../services/Configuration';

const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, operational_price, customer_price, balance_usd = 0, balance_uyu = 0, operational_limit, pre_paid, allow_overlimit } = req.body;
        const balance = new Balance({ email, operational_price, customer_price, balance_usd, balance_uyu, operational_limit, pre_paid, allow_overlimit });

        let balanceSaved = await balance.save();

        if (!balanceSaved) {
            return res.status(400).json({ error: 'Error creating Blanace' });
        }

        return res.status(201).json({ balanceSaved });
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred while saving the balance.' });
    }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
    const userEmail = req.body.email;

    try {
        const balance = await Balance.findOneAndUpdate({ email: userEmail }, req.body);

        if (!balance) {
            return res.status(404).json({ error: 'Balance does not exist' });
        }
        return res.status(201).json({ balance });
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred while saving the balance.' });
    }
};

const postBudget = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const budget = await BalanceServices.addBudget(req.body.email, Number(req.body.amount), req.body.budget_currency);
        return res.status(201).json({ message: 'Budget added successfully', budget });
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred while saving the balance.' });
    }
};

const getAll = async (req: Request, res: Response, next: NextFunction) => {
    let { page = 1, pageSize = 20 } = req.query;
    page = Number(page);
    pageSize = Number(pageSize);

    // Asegurarse de que page y pageSize sean números. Si no, establecer a los valores predeterminados.
    if (isNaN(page) || page <= 0) {
        page = 1;
    }
    if (isNaN(pageSize) || pageSize <= 0) {
        pageSize = 20;
    }

    // Obtén el total de documentos
    const totalDocuments = await Balance.countDocuments();

    return Balance.find()
        .then((balances: IBalance[]) => {
            // Calcular el total de páginas
            const totalPages = Math.ceil(Number(totalDocuments) / Number(pageSize));

            res.status(200).json({
                totalDocuments,
                totalPages,
                currentPage: page,
                balances
            });
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

const getOne = async (req: Request, res: Response, next: NextFunction) => {
    return Balance.findOne({ email: req.params.email });
};

const getBalance = async (req: Request, res: Response, next: NextFunction) => {
    const email = req.params.email;

    try {
        const balance = await getBalanceByEmail(email);

        if (!balance) {
            return res.status(404).json({ error: 'Balance does not exist' });
        }
        return res.status(201).json({ balance });
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred while saving the balance.' });
    }
}

const getBalanceByEmail = async (email: string) => {
    try{
        return await Balance.findOne({ email: email });
    }catch(error){
        throw new Error(`An error occurred while saving the balance. ${error}`);
    }
};

export default {
    create,
    getAll,
    getOne,
    update,
    getBalanceByEmail,
    postBudget
};
