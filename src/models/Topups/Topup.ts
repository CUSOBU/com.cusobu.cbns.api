import ITopup from '@src/interfaces/Topups/topup';
import { randomUUID } from 'crypto';
import { string } from 'joi';
import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const schemaOptions = {
    timestamps: true, // assigns createdAt and updatedAt fields to the schema
    toJSON: { virtuals: true }, // allow to populate virtuals in every query
    toObject: { virtuals: true },
    versionKey: false
};

export interface ITopups extends ITopup, Document {}

const TopupSchema: Schema = new Schema(
    {
        id: {
            type: String,
            default: () => uuidv4()
          },
        header: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true, default: 0 },
        cost: { type: Number, required: true, default: 0 },
        amount: { type: Number, required: true, default: 0 },
        active: { type: Boolean, required: true, default: true }
    },
    schemaOptions
);

export default mongoose.model<ITopups>('Topup', TopupSchema);

export {
    ITopup
}