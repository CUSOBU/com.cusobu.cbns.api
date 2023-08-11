import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { Status } from '../../common/Status';
import ITopupOrder from '@src/interfaces/Topups/topuporder';

const schemaOptions = {
    timestamps: true, // assigns createdAt and updatedAt fields to the schema
    toJSON: { virtuals: true }, // allow to populate virtuals in every query
    toObject: { virtuals: true },
    versionKey: false
};

export interface ITOrder extends ITopupOrder, Document {}

const TopupOrderSchema: Schema = new Schema(
    {
        id: {
            type: String,
            default: () => uuidv4()
        },
        email: { type: String, required: true },
        topupId: { type: String, required: true },
        senderName: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        budget: { type: Number, required: true, default: 0 },
        cost: { type: Number, required: true, default: 0 },
        amount: { type: Number, required: true, default: 0 },
        status: { type: String, required: true, default: Status.Pending },
        statusCode: { type: String, required: true, default: '0' },
        seller: { type: String, default: '0' },
        provider: { type: String, default: '0' }
    },
    schemaOptions
);

export default mongoose.model<ITOrder>('TopupOrder', TopupOrderSchema);

export { ITopupOrder };
