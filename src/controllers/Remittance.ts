import e, {Response, Request, NextFunction} from "express";
import Remittance, {IRemittance} from "../models/Remittance";
import {config} from "../config/config";
import codificator from "../common/Codification";
import Balance from "../services/Balance";
import ProviderBalance from "./ProviderBalance";
import {Status} from "../common/Status";
import remittanceServices  from "../services/Remittance";

const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            email = req.headers.email,
            full_name,
            phone_number,
            cardNumber,
            remittance_currency,
            budget_amount,
            budget_currency,
            remittance_rate = 0
        } = req.body;

        let encryptedCard = codificator.encrypt(cardNumber); // encriptar la tarjeta

        const olderRemittance: any = await Remittance.find()
            .sort({identifier: -1})
            .limit(1);
        const identifier =
            olderRemittance.length > 0 ? olderRemittance[0].identifier + 1 : 1;

        let remittancePrice = await remittanceServices.getRemittancePrices(
            email,
            budget_amount,
            budget_currency,
            remittance_currency,
            remittance_rate
        );

        console.log("remittancePrice:", remittancePrice);

        const remittance_amount = remittancePrice.remittance_amount;
        const operation_cost = remittancePrice.operation_cost;

        let remittance = new Remittance({});

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
            status: "Pending",
            statusCode: 0,
            webhook: config.URL + "/hook/mlc/" + identifier + "-" + encryptedCard
        });

        console.log("remittance:", remittance);

        await Balance.addBudget(email, operation_cost, budget_currency);

        return remittance
            .save()
            .then((remittance: IRemittance) => res.status(201).json({remittance}))
            .catch((error) => {
                res.status(400).json({error});
            });
    } catch (error) {
        return res.status(400).json({error});
    }
};

const update = (req: Request, res: Response, next: NextFunction) => {
    try {
        if (Object.keys(req.body).length === 0) {
            return res
                .status(400)
                .json({message: "Request body must not be empty"});
        }
        const remittanceId = req.params.id;

        let remittance = req.body;
        delete remittance.email;

        return Remittance.findOneAndUpdate({identifier: remittanceId}, remittance)
            .then((remittance) =>
                remittance
                    ? res.status(200).json({remittance})
                    : res.status(404).json({message: "Not found"})
            )
            .catch((error) => res.status(400).json({error}));
    } catch (error) {
        return res.status(400).json({error});
    }
};

const setStatusProvider = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {

        const provider = req.headers.email?.toString();
        const remittanceId = req.params.id;

        if (!provider || remittanceId == null) {
            return res.status(400).json({message: "Email is required"});
        }

        let remittance = {
            provider: req.body.status != "Pending" ? provider : "",
            status: req.body.status,
            statusCode: req.body.statusCode,
            evidence: req.body.evidence
        };

        let remittanceDB: any = await Remittance.findOne({
            identifier: remittanceId
        });
        if (!remittanceDB) {
            return res.status(404).json({message: "Not found"});
        }

        let balance = null;
        if (req.body.status == Status.Complete) {
            balance = await ProviderBalance.getBalanceByEmail(provider);
            if (!balance) {
                return res
                    .status(400)
                    .json({message: `Provider Balance not found1.`});
            }
            let balanceResponse = await ProviderBalance.addBudget(
                provider,
                remittanceDB.remittance_amount,
                remittanceDB.remittance_currency
            );
            if (!balanceResponse || balanceResponse.error) {
                return res.status(400).json({
                    message: `Provider Balance not found2. ${balanceResponse.error}`
                });
            }
        } else if (req.body.status == Status.Cancel) {
            balance = await Balance.getBalanceByEmail(remittanceDB.email);
            if (!balance) {
                return res.status(400).json({message: "Balance not found"});
            }
            let balanceResponse = await Balance.addBudget(
                remittanceDB.email,
                remittanceDB.operation_cost * -1,
                remittanceDB.budget_currency
            );
            if (!balanceResponse) {
                return res.status(400).json({
                    message: "Provider Balance not found3."
                });
            }
        }

        return Remittance.findOneAndUpdate({identifier: remittanceId}, remittance)
            .then(async (remittance) => {
                // Balance.addBudget(provider, remittance.remittance_amount * balance.operational_price, remittance.budget_currency);
                res.status(200).json({remittance});
            })
            .catch((error) => {
                res.status(400).json({error});
            });
    } catch (error) {
        return res.status(400).json({error});
    }
};

const filter = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let {
            email,
            status,
            startDate,
            endDate,
            currency,
            budget_currency,
            phone_number,
            source_reference
        } = req.body;
        let {page = 1, pageSize = 20} = req.query;

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
        let startOfWeek = new Date(
            Date.UTC(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                currentDate.getDate() - currentDate.getDay(),
                0,
                0,
                0
            )
        ); // Primer día de la semana (domingo)
        let endOfWeek = new Date(
            Date.UTC(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                currentDate.getDate() - currentDate.getDay() + 6,
                23,
                59,
                59
            )
        ); // Último día de la semana (sábado)

        // ELIMINAR
        let startOfYear = new Date(
            Date.UTC(currentDate.getFullYear(), 0, 1, 0, 0, 0)
        ); // Fecha inicial del año
        startOfWeek = startOfYear;

        if (startDate) {
            // Verify startDate & endDate
            if (!Date.parse(startDate)) {
                return res.status(400).json({error: "Invalid startDate"});
            } else {
                let localDate = new Date(startDate); // Convert string to Date object
                startDate = new Date(
                    Date.UTC(
                        localDate.getFullYear(),
                        localDate.getMonth(),
                        localDate.getDate(),
                        0,
                        0,
                        0
                    )
                ); // Convert to UTC
            }
        } else {
            startDate = startOfWeek;
        }
        if (endDate) {
            if (!Date.parse(endDate)) {
                return res.status(400).json({error: "Invalid status"});
            } else {
                let localDate = new Date(endDate); // Convert string to Date object
                endDate = new Date(
                    Date.UTC(
                        localDate.getFullYear(),
                        localDate.getMonth(),
                        localDate.getDate(),
                        23,
                        59,
                        59
                    )
                ); // Convert to UTC
            }
        } else {
            endDate = endOfWeek;
        }

        if (startDate && endDate) {
            filter["createdAt"] = {
                $gte: new Date(startDate), // Mayor o igual que startDate
                $lte: new Date(endDate) // Menor o igual que endDate
            };
        }

        if (status) {
            if (!Array.isArray(status)) {
                status = [status];
            }
            filter["status"] = {$in: status};
        }
        if (currency) {
            filter["currency"] = currency; // Estado del proceso
        }
        if (budget_currency) {
            filter["budget_currency"] = budget_currency; // Estado del proceso
        }
        if (source_reference) {
            filter["source_reference"] = source_reference; // Estado del proceso
        }
        if (phone_number) {
            filter["phone_number"] = phone_number; // Estado del proceso
        }

        if (role && role == "seller") {
            filter["email"] = email;
        } else if (role && role == "provider") {
            filter["provider"] = {$in: [email, "", null]};
        }

        // get documents count
        const totalDocuments = await Remittance.countDocuments(filter);

        // get remittances
        Remittance.find(filter)
            .sort({createdAt: -1})
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
            .catch((error) => res.status(400).json({error}));
    } catch (error) {
        return res.status(400).json({error});
    }
};

const getOne = (req: Request, res: Response, next: NextFunction) => {
    const remittanceId = req.params.id;

    if (!remittanceId) {
        return res.status(400).json({error: "Invalid remittance Ientifierd"});
    }

    Remittance.findOne({identifier: remittanceId}).then((remmitances) => {
        if (remmitances) {
            remmitances.cardNumber = codificator.decrypt(remmitances.cardNumber); // desencriptar la tarjeta
            res.status(200).json({remmitances});
        } else {
            res.status(404).json({message: "Not found"});
        }
    });
};

const getRemittancePrice = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const email: string = req.headers.email ? req.headers.email.toString() : "";
        const budget = Number(req.body.budget);
        const budget_currency = req.body.budget_currency;
        const remmitance_currency: string = req.body.remmitance_currency;
        let remittance_rate = 0;
        if (req.body.remittance_rate)
            remittance_rate = Number(req.body.remittance_rate);

        const remittance_prices = await remittanceServices.getRemittancePrices(
            email,
            budget,
            budget_currency,
            remmitance_currency,
            remittance_rate
        );

        res.status(200).json({remittance_prices});
    } catch (error) {
        return res.status(400).json({error});
    }
};

export default {
    create,
    update,
    filter,
    getOne,
    getRemittancePrice,
    setStatusProvider
};
