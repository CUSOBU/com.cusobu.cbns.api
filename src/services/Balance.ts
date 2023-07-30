import Balance from '../models/Balance';
import Configuration from '../services/Configuration';
 
const getBalanceByEmail = async (email: string) => {
    let balance = await Balance.findOne({ email: email });
    return balance; 
};

const addBudget = async (email: string, budget: number, budget_currency: string) => {

    try {
        if (!email || !budget || !budget_currency) {
            return { status: 400, error: 'Missing parameters' };
        }
        let balance = await Balance.findOne({ email: email });
    
        if (!balance) {
            return { status: 404, error: 'Balance does not exist' };
        }
    
        if (budget_currency === 'USD') {
            balance.balance_usd += budget;
        } else if (budget_currency === 'UYU') {
            balance.balance_uyu += budget;
        } else {
            return { status: 400, error: 'Invalid currency' };
        }
    
        balance = await balance.save();

        if (balance.operational_limit < balance.balance_usd + balance.balance_uyu / Number(await Configuration.getValue("UYU_EXCHANGE"))) {
           throw new Error('Balance exceeds operational limit');
        }
    
        return balance;
    } catch (error) {
        throw new Error(`An error occurred while saving the balance. ${error}`);
    }
};

export default {
    getBalanceByEmail,
    addBudget
}