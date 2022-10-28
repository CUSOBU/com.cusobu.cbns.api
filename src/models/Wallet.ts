import mongoose, { Document, Schema } from 'mongoose';

const schemaOptions = {
    timestamps: true, // assigns createdAt and updatedAt fields to the schema
    toJSON: { virtuals: true }, // allow to populate virtuals in every query
    toObject: { virtuals: true },
    versionKey: false
};

export interface IWallet {
    name: string;
    user: string;
}

export interface IWalletModel extends IWallet, Document {}

const WalletSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        user: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User',
            autopopulate: {
                select: 'name _id',
                maxDepth: 1
            }
        }
    },
    schemaOptions
);

WalletSchema.plugin(require('mongoose-autopopulate'));

export default mongoose.model<IWalletModel>('Wallet', WalletSchema);
