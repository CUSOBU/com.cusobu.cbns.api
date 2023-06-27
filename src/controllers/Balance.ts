import { Response, Request, NextFunction } from 'express';
import Balance, { IBalance } from '../models/Balance';
import User from '../models/User'


const create = async (req: Request, res: Response, next: NextFunction) => {
    const {email, operational_price, customer_price, balance_usd, balance_uyu, operational_limit, pre_paid, allow_overlimit} = req.body;
    const balance = new Balance({ email, operational_price, customer_price, balance_usd, balance_uyu, operational_limit, pre_paid, allow_overlimit });

    const user = await User.findOne({ email: email });

    if (!user) {
        return res.status(404).json({ error: 'User does not exist' });
    }

    return balance
        .save()
        .then((balance: IBalance) => res.status(201).json({ balance }))
        .catch((error) => {
            res.status(400).json({ error });
        });
};

const update = async (req: Request, res: Response, next: NextFunction) => {
    const userEmail = req.params.email;

    const balance = await Balance.findOneAndUpdate({ email: userEmail }, req.body)

    if (!balance) {
        return res.status(404).json({ error: 'Balance does not exist' });
    }
    return res.status(201).json({ balance })
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
    return Balance.findOne({ email: req.params.email })
};

const getBalanceByEmail = async (email: string) => {
    return Balance.findOne({ email: email })
}

export default { 
    create,
    getAll,
    getOne,
    update,
    getBalanceByEmail
};

