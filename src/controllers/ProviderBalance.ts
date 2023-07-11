import { Response, Request, NextFunction } from 'express';
import ProviderBalance, { IProviderBalance } from '../models/ProviderBalance';
import { config } from '../config/config';

const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, operational_price, balance_mlc = 0, balance_cup = 0, operational_limit, pre_paid, allow_overlimit } = req.body;
        const providerbalance = new ProviderBalance({ email, operational_price, balance_mlc, balance_cup, operational_limit, pre_paid, allow_overlimit });

        let providerBalance = await providerbalance.save();

        if (!providerBalance) {
            return res.status(400).json({ error: 'Error creating Blanace (${balance})' });
        }
        return res.status(201).json({ providerBalance });
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred while saving the balance.' });
    }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
    const email = req.body.email;

    try {
        const balance = await ProviderBalance.findOneAndUpdate({ email: email }, req.body);

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
        const budget = await addBudget(req.body.email, Number(req.body.amount), req.body.budget_currency);
        if (budget.error) {
            return res.status(budget.status).json({ error: budget.error });
        }
        return res.status(201).json({ message: 'Budget added successfully', budget });
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred while saving the balance.' });
    }
};

const addBudget = async (email: string, budget: number, budget_currency: string) => {
    try {
        if (!email || !budget || !budget_currency) {
            return { status: 400, error: 'Missing parameters' };
        }
        let balance = await ProviderBalance.findOne({ email: email });

        if (!balance) {
            return { status: 404, error: 'Balance does not exist' };
        }

        if (budget_currency === 'MLC') {
            balance.balance_mlc += budget;
        } else if (budget_currency === 'CUP') {
            balance.balance_cup += budget * balance.operational_price;
        } else {
            throw new Error('Invalid currency');
        }

        if (balance.operational_limit < balance.balance_mlc + balance.balance_cup / config.CUP_EXCHANGE) {
           throw new Error('Budget exceeds operational limit');
        }

        balance = await balance.save();
        return { status: 200, balance: balance };

    } catch (error) {
        throw error;
    }
};

const getBalance = async (req: Request, res: Response, next: NextFunction) => {
    const email = req.params.email;
    const balance = await ProviderBalance.findOne({ email: email });
    return res.status(201).json({ balance });
};

const getBalanceByEmail = async (email: string) => {
    let balance = await ProviderBalance.findOne({ email: email });
    return balance;
};

export default {
    create,
    update,
    postBudget,
    getBalanceByEmail,
    getBalance,
    addBudget
};
