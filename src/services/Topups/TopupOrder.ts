import TopupOrder from '../../models/Topups/TopupOrder';
import {Status} from '../../common/Status';
import ProviderBalance from '../../services/ProviderBalance';
import BalanceService from '../../services/Balance';
import {Currencies} from '../../common/Currencies';

const create = async (email: string, topupId: string, senderName: string, phoneNumber: string, budget: number, cost: number, amount: number, seller: string) => {
    try {
        const topupOrder = new TopupOrder({email, topupId, senderName, phoneNumber, budget, amount, cost, seller});
        return await topupOrder.save();
    } catch (error) {
        console.log(error);
        throw new Error('Error creating topup order');
    }
};

const patchTopupOrder = async (id: string, params: {}) => {
    try {
        const topupOrder = await TopupOrder.findOne({id});
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
        const topup = await TopupOrder.findOneAndDelete({id});
        if (!topup) {
            throw new Error('Topup not found');
        }
        return topup;
    } catch (error) {
        console.log(error);
        throw new Error('Error deleting topup');
    }
};

const filter = async (page: Number, pageSize: Number, status: {}, startDate: Date, endDate: Date, phoneNumber: string) => {
    try {
        page = Number(page);
        pageSize = Number(pageSize);

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


        if (startDate!=null) {
            console.log("Start date", startDate)
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
        if (endDate != null) {
            console.log("End date", endDate)
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

        // Create filter
        let filter: any = {};
        if (startDate != null && endDate != null) {
            console.log("Filtering")
            filter["createdAt"] = {
                $gte: new Date(startDate), // Mayor o igual que startDate
                $lte: new Date(endDate) // Menor o igual que endDate
            };
        }


        if (status) {
            console.log('status', status);
            if (!Array.isArray(status)) {
                console.log('status is not array');
                status = [status];
            }
            filter['status'] = {$in: status};
        }
        if (phoneNumber) {
            filter['phoneNumber'] = phoneNumber;
        }

        console.log('filter', filter);
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
        const topupOrder = await TopupOrder.findOne({id});
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

const setStatus = async (id: string, status: Status, provider: string, evidence:string) => {
    console.log('topupoder_id: ', id);
    console.log('Status: ', status);
    console.log('provider: ', provider);
    console.log('evidence: ', evidence);

    if (!id) {
        throw new Error('Missing required field "id"');
    }
    if (!status) {
        throw new Error('Missing required field "status"');
    }

    //find topup order
    const topupOrder = await TopupOrder.findOne({id});
    if (!topupOrder) {
        throw new Error('Topup order not found');
    }
    console.log("topupOrder Found", topupOrder);

    if (status == Status.Delivery) {
        if (!provider) {
            throw new Error('Missing required field "provider"');
        }
    }
    if (status == Status.Pending) {
        provider = "";
    }
    if (status == Status.Complete) {
        let providerBalance = await ProviderBalance.getProviderBalance({email: provider});
        if (!providerBalance) {
            throw new Error('Provider not found');
        }
        console.log("providerBalance", providerBalance);

        let sellerBalance = BalanceService.getBalanceByEmail(topupOrder.seller);
        if (!sellerBalance) {
            throw new Error('Seller not found');
        }
        console.log("sellerBalance", sellerBalance);

        providerBalance.balance_cup += (topupOrder.amount + (providerBalance.topups_rate ? providerBalance.topups_rate : 0));
        providerBalance = await providerBalance.save();
        if (!providerBalance) {
            throw new Error('Error updating provider balance');
        }

        await BalanceService.addBudget(topupOrder.seller, topupOrder.cost, Currencies.UYU);
    }
    const responseService = await topupOrder.set({status: status, provider: provider, evidence:evidence}).save();
    console.log("AQUIIIIIII");

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
