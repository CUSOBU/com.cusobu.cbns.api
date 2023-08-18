import Remittance from '../models/Remittance';
import Balance from "../controllers/Balance";
import BalanceService from "../services/Balance";
import Configuration from "../services/Configuration";




const getRemittances = async (params: any) => {
    return Remittance.find(params);
};

const getRemittancesByDate = async (params: any) => {
    return  Remittance.aggregate([
        {
            $match: params // Filtrar las remesas según los parámetros proporcionados
        },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: '%Y-%m-%d',
                        date: '$createdAt'
                    }
                },
                count: { $sum: 1 } // Contar las remesas en cada fecha
            }
        },
        {
            $project: {
                date: '$_id',
                cant: '$count'
            }
        }
    ]);
};

const getRemittancesByStatus = async (params: any) => {
    return  Remittance.aggregate([
        {
            $match: params // Filtrar las remesas según los parámetros proporcionados
        },
        {
            $group: {
                _id: '$status', // Agrupar por estado
                count: { $sum: 1 } // Contar las remesas en cada estado
            }
        },
        {
            $project: {
                _id: 0,
                state: '$_id',
                count: 1
            }
        }
    ]);
};

const getRemittancePrices = async (email: string, budget_amount: number, budget_currency: string, remmitance_currency: string, remittance_rate: number) => {
    try {
        let balance = await BalanceService.getBalanceByEmail(email);
        if (!balance) {
            throw new Error("Balance not found");
        }
        const operational_price: number = balance.operational_price;

        if (remittance_rate < operational_price && remittance_rate != 0) {
            throw new Error("Remittance rate is lower than operation cost");
        }
        const customer_price: number =
            remittance_rate != 0 ? remittance_rate : balance.customer_price;

        let remittance_amount = (budget_amount / customer_price) ;

        let operation_cost =  (budget_amount - (budget_amount*(customer_price-operational_price))).toFixed()

        if (budget_currency == "UYU") {
            remittance_amount = remittance_amount / Number(await Configuration.getValue("UYU_EXCHANGE"));
        }
        if (remmitance_currency == "CUP") {
            remittance_amount = remittance_amount * Number(await Configuration.getValue("CUP_EXCHANGE"));
        }

        return {
            budget_amount: Number(budget_amount),
            remittance_amount: Math.trunc(Number(remittance_amount)),
            operation_cost: Number(operation_cost),
            customer_price: Number(customer_price),
            operational_price: Number(operational_price)
        };

    } catch (error) {
        throw error;
    }
};

export default {
    getRemittances,
    getRemittancesByDate,
    getRemittancesByStatus,
    getRemittancePrices
};







