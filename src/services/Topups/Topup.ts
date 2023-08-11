import Topup from '../../models/Topups/Topup';
import { Status } from '../../common/Status';

const create = async (header: string, description: String, price: Number, cost: Number, amount: Number) => {
    try {
        const topup = new Topup({ header, description, price, cost, amount });
        return await topup.save();
    } catch (error) {
        throw new Error('Error creating topup');
    }
};

const patchTopup = async (id: string, params: {}) => {
    try {
        const topup = await Topup.findOne({ id });
        if (!topup) {
            throw new Error('Topup not found');
        }
        topup.set(params);
        await topup.save();
        console.log(topup);
        return topup;
    } catch (error) {
        console.log(error);
        throw new Error('Error updating topup');
    }
};

const deleteTopup = async (id: string) => {
    const topup = await Topup.findOneAndDelete({ id });
    if (!topup) {
        throw new Error('Topup not found');
    }
    return topup;
};

const getTopups = async (page: Number, pageSize: Number) => {
    try {
        page = Number(page);
        pageSize = Number(pageSize);

        const topups = await Topup.find()
            .skip((Number(page) - 1) * Number(pageSize))
            .limit(Number(pageSize))
            .then((topups) => {
                return topups;
            });

        const totalDocuments = await Topup.countDocuments();
        const totalPages = Math.ceil(totalDocuments / Number(pageSize));

        return {
            totalDocuments,
            totalPages,
            page,
            pageSize,
            data: topups
        };
    } catch (error) {
        console.log(error);
        throw new Error('Error retrieving topups');
    }
};

const getTopup = async (id: string) => {
    try {
        const topup = await Topup.findOne({ id });
        console.log("topup: ", topup);
        if (!topup) {
            throw new Error('Topup not found');
        }
        return topup;
    } catch (error) {
        console.log(error);
        throw new Error('Error retrieving topup');
    }
};


export default {
    create,
    patchTopup,
    deleteTopup,
    getTopups,
    getTopup
};
