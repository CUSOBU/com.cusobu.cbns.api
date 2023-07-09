import { Response, Request, NextFunction } from 'express';
import { config } from '../config/config';
import balanceController from './Balance';
import providerBalanceController from './ProviderBalance';
import serviceRemittances from '../services/Remittance';

const getBalance = async (req: Request, res: Response, next: NextFunction) => {
    let balanceData = {};
    let remittancesDates = {};
    let remittanceByStatus = {};

    const email = (req.params.email ? req.params.email : req.headers.email)?.toString();
    const role = req.headers.role;
    if (!email || !role) return res.status(400).json({ error: 'Email is required' });

    console.log('console', email, role);

    let balance = null; //await balanceController.getBalanceByEmail(email);

    if (role === 'seller') {
        balance = await balanceController.getBalanceByEmail(email);
        if (!balance) {
            return res.status(404).json({ error: 'Balance does not exist' });
        }
        balanceData = {
            local_balance: balance.balance_uyu,
            ext_balance: balance.balance_usd,
            local_currency: 'UYU',
            ext_currency: 'USD',
            operational_price: balance.operational_price,
            customer_price: balance.customer_price,
            operational_limit: balance.operational_limit
        };

        //Remittances Data
        remittancesDates = await serviceRemittances.getRemittancesByDate({
            email: email,
            createdAt: {
                $gte: balance.last_update, // Mayor o igual que startDate
                $lte: new Date() // Menor o igual que endDate
            }
        });

        remittanceByStatus = await serviceRemittances.getRemittancesByStatus({
            email: email,
            createdAt: {
                $gte: balance.last_update, // Mayor o igual que startDate
                $lte: new Date() // Menor o igual que endDate
            }
        });

    }
    if (role === 'provider') {
        balance = await providerBalanceController.getBalanceByEmail(email);
        if (!balance) {
            return res.status(404).json({ error: 'Balance does not exist' });
        }
        balanceData = {
            local_balance: balance.balance_cup,
            ext_balance: balance.balance_mlc,
            local_currency: 'CUP',
            ext_currency: 'MLC',
            operational_price: balance.operational_price,
            customer_price: balance.operational_price,
            operational_limit: balance.operational_limit
        };

        //Remittances Data
        remittancesDates = await serviceRemittances.getRemittancesByDate({
            provider: email,
            createdAt: {
                $gte: balance.last_update, // Mayor o igual que startDate
                $lte: new Date() // Menor o igual que endDate
            }
        });

        remittanceByStatus = await serviceRemittances.getRemittancesByStatus({
            provider: email,
            createdAt: {
                $gte: balance.last_update, // Mayor o igual que startDate
                $lte: new Date() // Menor o igual que endDate
            }
        });
    }

    return res.status(200).json({ message: 'OK', balanceData, remittancesDates, remittanceByStatus });
};

export default {
    getBalance
};
