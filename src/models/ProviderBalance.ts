import mongoose, { Document, Schema } from 'mongoose';
import IProviderBalance from '../interfaces/provider_balance';

const schemaOptions = {
    timestamps: true, // assigns createdAt and updatedAt fields to the schema
    toJSON: { virtuals: true }, // allow to populate virtuals in every query
    toObject: { virtuals: true },
    versionKey: false
};

export interface IUserProviderBalance extends IProviderBalance, Document {}

const ProviderBalanceSchema: Schema = new Schema(
    {
        email: { type: String, required: true, unique: true },
        operational_price: { type: Number, required: true, default: 1},
        balance_mlc: { type: Number, required: true, default: 0 },
        balance_cup: { type: Number, required: true, default: 0 },
        operational_limit: { type: Number, required: true, default: 0 }, //operational limit = balance_mlc + balance_cup/exchange
        pre_paid: { type: Boolean, required: true, default: false },
        allow_overlimit: { type: Boolean, required: true, default: false },
        last_update: { type: Date, required: true, default: Date.now }
    },
    schemaOptions
);

export default mongoose.model<IUserProviderBalance>('ProviderBalance', ProviderBalanceSchema);

export {
    IProviderBalance
}







