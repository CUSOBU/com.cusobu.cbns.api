import TopupOrder from '../../models/Topups/TopupOrder';
import { Status } from '../../common/Status';
import ProviderBalance from '../../services/ProviderBalance';
import BalanceService from '../../services/Balance';
import { Currencies } from '../../common/Currencies';

const create = async (email: string, topupId: string, senderName: string, phoneNumber: string, budget: number, cost: number, amount: number, seller: string) => {
    try {
        const topupOrder = new TopupOrder({ email, topupId, senderName, phoneNumber, budget, amount, cost, seller });
        return await topupOrder.save();
    } catch (error) {
        console.log(error);
        throw new Error('Error creating topup order');
    }
};

const patchTopupOrder = async (id: string, params: {}) => {
    try {
        const topupOrder = await TopupOrder.findOne({ id });
        if (!topupOrder) {
            throw new Error('Topup order not found');
        }
        topupOrder.set(params);
        await topupOrder.save();
        return topupOrder;
    } catch (error) {
        console.log(error);
        throw new Error('Error updating topup order');
    }
};

const deleteTopupOrder = async (id: string) => {
    try {
        const topup = await TopupOrder.findOneAndDelete({ id });
        if (!topup) {
            throw new Error('Topup not found');
        }
        return topup;
    } catch (error) {
        console.log(error);
        throw new Error('Error deleting topup');
    }
};

const filter = async (page: Number, pageSize: Number, status: {}) => {
    try {
        page = Number(page);
        pageSize = Number(pageSize);

        // Create filter
        let filter: any = {};
        if (status) {
            console.log('status', status);
            if (!Array.isArray(status)) {
                console.log('status is not array');
                status = [status];
            }
            filter['status'] = { $in: status };
        }

        const topupOrders = await TopupOrder.find(filter)
            .skip((Number(page) - 1) * Number(pageSize))
            .limit(Number(pageSize))
            .then((topupOrders) => {
                return topupOrders;
            });

        const totalDocuments = await TopupOrder.countDocuments();
        const totalPages = Math.ceil(totalDocuments / Number(pageSize));

        return {
            totalDocuments,
            totalPages,
            page,
            pageSize,
            data: topupOrders
        };
    } catch (error) {
        console.log(error);
        throw new Error('Error retrieving topups');
    }
};

const getTopupOrder = async (id: string) => {
    try {
        if (!id) {
            throw new Error('Missing required field "id"');
        }
        console.log('id', id);
        const topupOrder = await TopupOrder.findOne({ id });
        console.log('topupOrder', topupOrder);
        if (!topupOrder) {
            throw new Error('Topup order not found');
        }
        return topupOrder;
    } catch (error) {
        console.log(error);
        throw new Error('Error retrieving topup order');
    }
};

const setStatus = async (id: string, status: Status, provider: string) => {
    console.log('topupoder_id: ', id);
    console.log('Status: ', status);
    console.log('provider: ', provider);

    if (!id) {
        throw new Error('Missing required field "id"');
    }
    if (!status) {
        throw new Error('Missing required field "status"');
    }

    //find topup order
    const topupOrder = await TopupOrder.findOne({ id });
    if (!topupOrder) {
        throw new Error('Topup order not found');
    }
    console.log("topupOrder", topupOrder);

    if (status == Status.Delivery) {
        if (!provider) {
            throw new Error('Missing required field "provider"');
        }
    }
    if (status == Status.Pending) {
        provider = "";
    }
    if(status==Status.Complete){
        let providerBalance = await ProviderBalance.getProviderBalance({email:provider});
        if(!providerBalance){
            throw new Error('Provider not found');
        }
        console.log("providerBalance",providerBalance);
        
        let sellerBalance = BalanceService.getBalanceByEmail(topupOrder.seller);
        if(!sellerBalance){
            throw new Error('Seller not found');
        }
        console.log("sellerBalance",sellerBalance);
        
        providerBalance.balance_cup += (topupOrder.amount + (providerBalance.topups_rate?providerBalance.topups_rate:0));
        providerBalance = await providerBalance.save();
        if(!providerBalance){
            throw new Error('Error updating provider balance');
        }

        await BalanceService.addBudget(topupOrder.seller, topupOrder.cost, Currencies.UYU);
    }
    const responseService = await topupOrder.set({ status: status, email:provider }).save();
    if (!responseService) {
        throw new Error('Error updating topup order');
    }
    return responseService;
};

export default {
    create,
    patchTopupOrder,
    deleteTopupOrder,
    filter,
    getTopupOrder,
    setStatus
};
