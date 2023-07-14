import Topup from '../../models/Topups/TopupOrder';
import { Status } from '../../common/Status';

const create = async (topupId:string, senderName:string, phoneNumber:string, budget:number, cost:number, amount:number, seller:string) => {
    try {
        const topupOrder = new Topup({ topupId, senderName, phoneNumber, budget, amount, cost, seller });
        return await topupOrder.save();
    } catch (error) {
        console.log(error);
        throw new Error('Error creating topup order');
    }
};

// const patchTopup = async (id: string, params: {}) => {
//     try {
//         const topup = await Topup.findOne({ id });
//         if (!topup) {
//             throw new Error('Topup not found');
//         }
//         topup.set(params);
//         await topup.save();
//         console.log(topup);
//         return topup;
//     } catch (error) {
//         console.log(error);
//         throw new Error('Error updating topup');
//     }
// };

// const deleteTopup = async (id: string) => {
//     const topup = await Topup.findOneAndDelete({ id });
//     if (!topup) {
//         throw new Error('Topup not found');
//     }
//     return topup;
// };

// const getTopups = async (page: Number, pageSize: Number) => {
//     try {
//         page = Number(page);
//         pageSize = Number(pageSize);

//         const topups = await Topup.find()
//             .skip((Number(page) - 1) * Number(pageSize))
//             .limit(Number(pageSize))
//             .then((topups) => {
//                 return topups;
//             });

//         const totalDocuments = await Topup.countDocuments();
//         const totalPages = Math.ceil(totalDocuments / Number(pageSize));

//         return {
//             totalDocuments,
//             totalPages,
//             page,
//             pageSize,
//             data: topups
//         };
//     } catch (error) {
//         console.log(error);
//         throw new Error('Error retrieving topups');
//     }
// };

export default {
    create
};
