import mongoose, { Document, Schema } from 'mongoose';
import IBalance from '../interfaces/balance';

const schemaOptions = {
    timestamps: true, // assigns createdAt and updatedAt fields to the schema
    toJSON: { virtuals: true }, // allow to populate virtuals in every query
    toObject: { virtuals: true },
    versionKey: false
};

export interface IUserBalance extends IBalance, Document {}

const BalanceSchema: Schema = new Schema(
    {
        email: { type: String, required: true, unique: true },
        operational_price: { type: Number, required: true, default: 1},
        customer_price: { type: Number, required: true, default: 1 },
        balance_usd: { type: Number, required: true, default: 0 },
        balance_uyu: { type: Number, required: true, default: 0 },
        operational_limit: { type: Number, required: true, default: 0 },
        pre_paid: { type: Boolean, required: true, default: false },
        allow_overlimit: { type: Boolean, required: true, default: false },
        last_update: { type: Date, required: true, default: Date.now }
    },
    schemaOptions
);

export default mongoose.model<IUserBalance>('Balance', BalanceSchema);

export {
    IBalance
}