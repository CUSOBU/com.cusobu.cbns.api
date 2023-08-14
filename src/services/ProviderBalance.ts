import ProviderBalance from '../models/ProviderBalance';
import {Currencies} from '../common/Currencies';

const getProviderBalance = async (params: any) => {
    console.log('params', params)
    const providerBalance = await ProviderBalance.findOne(params);
    return providerBalance;
};

const addBudget = async (email: string, amount: number, currency: string) => {
    
    if (!email || !amount || !currency) {
       throw new Error('Missing parameters');
    }

    let providerBalance = await ProviderBalance.findOne({ email: email });
    if (!providerBalance) {
        throw  new Error('Provider balance does not exist');
    };

    if (currency === Currencies.CUP) {
        providerBalance.balance_cup += amount;
    };
    if (currency === Currencies.MLC) {
        providerBalance.balance_mlc += amount;
    }

    providerBalance = await providerBalance.save();

    return providerBalance;

};

export default {
    getProviderBalance,
}