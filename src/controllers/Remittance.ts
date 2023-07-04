import e, { Response, Request, NextFunction } from 'express';
import Remittance, { IRemittance } from '../models/Remittance';
import { config } from '../config/config';
import walak from '../services/WalakAPI';
import codificator from '../common/Codification';
import Balance from './Balance';
import { number } from 'joi';

const create = async (req: Request, res: Response, next: NextFunction) => {
    const { email, full_name, phone_number, cardNumber, remittance_currency, budget_amount, budget_currency} = req.body;

    let encryptedCard = codificator.encrypt(cardNumber); // encriptar la tarjeta

    const identifier = (await Remittance.countDocuments()) + 1;
    const webhook = config.URL + '/walak/mlc/' + identifier + '-' + encryptedCard;

    const remittancePrice = await getPrices(email, budget_amount, budget_currency, remittance_currency);
    const remittance_amount = remittancePrice['remittance_amount'];
    const operation_cost = remittancePrice['operation_cost'];

    let remittance = new Remittance({});
    if (remittance_currency == 'CUP') {
        //Poner recarga CUP
        remittance = new Remittance({
            identifier,
            email,
            full_name,
            phone_number,
            cardNumber: encryptedCard,
            remittance_amount: remittance_amount,
            remittance_currency,
            budget_amount,
            operation_cost,
            budget_currency,
            status: 'Pending',
            statusCode: 0
        });
    } else if (remittance_currency == 'MLC') {
        // Remittance MLC
        let remittanceWalak = { email, cardNumber, full_name, phone_number, remittance_amount, webhook };
        let responseSource = await walak.postRemittance(remittanceWalak);

        remittance = new Remittance({
            identifier,
            email: email,
            full_name,
            phone_number,
            cardNumber: encryptedCard,
            remittance_amount: remittance_amount,
            remittance_currency,
            budget_amount,
            operation_cost,
            budget_currency,
            source_reference: responseSource['id'],
            status: responseSource['status'],
            statusCode: responseSource['statusCode'],
            webhook: webhook
        });
    } else {
        res.status(400).json({ error: 'Currency is not valid' });
    }

    await Balance.addBudget(email, operation_cost, budget_currency);

    return remittance
        .save()
        .then((remittance: IRemittance) => res.status(201).json({ remittance }))
        .catch((error) => {
            res.status(400).json({ error });
        });
};

const update = (req: Request, res: Response, next: NextFunction) => {
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'Request body must not be empty' });
    }
    const remittanceId = req.params.id;

    let remittance = req.body;
    delete remittance.email;

    return Remittance.findOneAndUpdate({ identifier: remittanceId }, remittance)
        .then((remittance) => (remittance ? res.status(200).json({ remittance }) : res.status(404).json({ message: 'Not found' })))
        .catch((error) => res.status(400).json({ error }));
};

const setStatusProvider = async (req: Request, res: Response, next: NextFunction) => {
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'Request body must not be empty' });
    }

    const provider = req.headers.email?.toString();
    const remittanceId = req.params.id;

    if (!provider || remittanceId == null) {
        return res.status(400).json({ message: 'Email is required' });
    }

    let remittance = {provider: provider, status: req.body.status, statusCode: req.body.statusCode, evidence: req.body.evidence};
    console.log("remittance", remittance)

    return Remittance.findOneAndUpdate({ identifier: remittanceId }, remittance)
        .then(async (remittance) => {
            if (!remittance) {
                return res.status(404).json({ message: 'Not found' });
            }
            console.log("remittance", remittance)
            let balance = await Balance.getBalanceByEmail(provider)
            console.log("balance", balance)
            if(!balance){
                return res.status(500).json({ message: 'Balance not found' });
            }
            Balance.addBudget(provider, remittance.remittance_amount*balance.operational_price, remittance.budget_currency);
            res.status(200).json({ remittance })            
        })
        .catch((error) => res.status(400).json({ error }));
};

const search = async (req: Request, res: Response, next: NextFunction) => {
    let { page = 1, pageSize = 20, status } = req.query;
    page = Number(page);
    pageSize = Number(pageSize);

    // Asegurarse de que page y pageSize sean números. Si no, establecer a los valores predeterminados.
    if (isNaN(page) || page <= 0) {
        page = 1;
    }
    if (isNaN(pageSize) || pageSize <= 0) {
        pageSize = 20;
    }

    const query = status ? { status, email: req.body.email } : {};

    // Obtén el total de documentos
    const totalDocuments = await Remittance.countDocuments(query);

    Remittance.find(query)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .then((remittances) => {
            remittances = remittances.map((remittance) => {
                remittance.cardNumber = codificator.decrypt(remittance.cardNumber); // desencriptar la tarjeta
                return remittance;
            });

            // Calcular el total de páginas
            const totalPages = Math.ceil(Number(totalDocuments) / Number(pageSize));

            res.status(200).json({
                totalDocuments,
                totalPages,
                currentPage: page,
                remittances
            });
        })
        .catch((error) => res.status(500).json({ error }));
};

const filter = async (req: Request, res: Response, next: NextFunction) => {
    let { email, status, startDate, endDate, currency, budget_currency, phone_number, source_reference } = req.body;
    let { page = 1, pageSize = 20 } = req.query;

    if (!email) {
        email = req.headers.email;
    }


    page = Number(page);
    pageSize = Number(pageSize);

    const role = req.headers.role;

    // set default values to page and pageSize if they are not numbers
    if (isNaN(page) || page <= 0) {
        page = 1;
    }
    if (isNaN(pageSize) || pageSize <= 0) {
        pageSize = 20;
    }

    // Create filter
    let filter: any = {};

    //Prepare Dates

    let currentDate = new Date();
    let startOfWeek = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay(), 0, 0, 0)); // Primer día de la semana (domingo)
    let endOfWeek = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay() + 6, 23, 59, 59)); // Último día de la semana (sábado)

    // ELIMINAR
    let startOfYear = new Date(Date.UTC(currentDate.getFullYear(), 0, 1, 0, 0, 0)); // Fecha inicial del año
    startOfWeek = startOfYear;

    if (startDate) {
        // Verify startDate & endDate
        if (!Date.parse(startDate)) {
            return res.status(400).json({ error: 'Invalid startDate' });
        } else {
            let localDate = new Date(startDate); // Convert string to Date object
            startDate = new Date(Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), 0, 0, 0)); // Convert to UTC
        }
    } else {
        startDate = startOfWeek;
    }
    if (endDate) {
        if (!Date.parse(endDate)) {
            return res.status(400).json({ error: 'Invalid status' });
        } else {
            let localDate = new Date(endDate); // Convert string to Date object
            endDate = new Date(Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), 23, 59, 59)); // Convert to UTC
        }
    } else {
        endDate = endOfWeek;
    }

    filter['createdAt'] = {
        $gte: new Date(startDate), // Mayor o igual que startDate
        $lte: new Date(endDate) // Menor o igual que endDate
    };

    if (status) {
        if (!Array.isArray(status)) {
            status = [status];
        }
        filter['status'] = { $in: status };
    }
    if (currency) {
        filter['currency'] = currency; // Estado del proceso
    }
    if (budget_currency) {
        filter['budget_currency'] = budget_currency; // Estado del proceso
    }
    if (source_reference) {
        filter['source_reference'] = source_reference; // Estado del proceso
    }
    if (phone_number) {
        filter['phone_number'] = phone_number; // Estado del proceso
    }
    if (role && role == 'seller') {
        filter['email'] = email;
    }else if (role && role == 'provider') {
        filter['provider'] = { $in: [email,"", null] }; 
        filter['remittance_currency'] = "CUP"; 
    }

    // get documents count
    const totalDocuments = await Remittance.countDocuments(filter);

    // get remittances
    Remittance.find(filter)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .then((remittances) => {
            remittances = remittances.map((remittance) => {
                remittance.cardNumber = codificator.decrypt(remittance.cardNumber); // desencriptar la tarjeta
                return remittance;
            });

            // Calcular el total de páginas
            const totalPages = Math.ceil(Number(totalDocuments) / Number(pageSize));

            res.status(200).json({
                totalDocuments,
                totalPages,
                currentPage: page,
                remittances
            });
        })
        .catch((error) => res.status(400).json({ error }));
};

const getOne = (req: Request, res: Response, next: NextFunction) => {
    const remittanceId = req.params.id;

    Remittance.findOne({ identifier: remittanceId }).then((remmitances) => {
        if (remmitances) {
            remmitances.cardNumber = codificator.decrypt(remmitances.cardNumber); // desencriptar la tarjeta
            res.status(200).json({ remmitances });
        } else {
            res.status(404).json({ message: 'Not found' });
        }
    });
};

const getRemittancePrice = async (req: Request, res: Response, next: NextFunction) => {
    const email = req.body.email;

    const budget = Number(req.body.budget);
    const budget_currency = req.body.budget_currency;
    const remmitance_currency: string = req.body.remmitance_currency;

    const remittance_prices = await getPrices(email, budget, budget_currency, remmitance_currency);

    res.status(200).json({ message: 'ok', remittance_prices });
};

const getPrices = async (email: string, budget_amount: number, budget_currency: string, remmitance_currency: string) => {
    const balance = await Balance.getBalanceByEmail(email);

    if (!balance) {
        return { budget_amount: 0, remittance_amount: 0, operation_cost: 0 };
    }

    const operational_price: number = balance.operational_price;
    const customer_price: number = balance.customer_price;

    let remittance_amount = (budget_amount * 1) / customer_price;
    let operation_cost = remittance_amount * operational_price;

    if (budget_currency == 'UYU') {
        remittance_amount = remittance_amount / Number(config.uyu_exchange_rate);
    }
    if (remmitance_currency == 'CUP') {
        remittance_amount = remittance_amount * Number(config.cup_exchange_rate);
    }

    const remittance_prices = { budget_amount: Number(budget_amount.toFixed()), remittance_amount: Math.round(remittance_amount), operation_cost: Number(operation_cost.toFixed(2)) };

    return remittance_prices;
};

export default {
    create,
    update,
    search,
    filter,
    getOne,
    getRemittancePrice,
    setStatusProvider
};
