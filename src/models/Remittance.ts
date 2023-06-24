import mongoose, { Document, Schema } from 'mongoose';
import IRemittance from '../interfaces/remittance';


const schemaOptions = {
    timestamps: true, // assigns createdAt and updatedAt fields to the schema
    toJSON: { virtuals: true }, // allow to populate virtuals in every query
    toObject: { virtuals: true },
    versionKey: false
};

export interface IRemittanceModel extends IRemittance, Document {}

const RemittanceSchema: Schema = new Schema(
    {
        identifier: { type: Number, required: true, unique: true },
        user_email: { type: String, required: true },
        card: { type: String, required: true },
        full_name: { type: String, required: true },
        phone_number: { type: String, required: true },
        amount: { type: Number, required: true },
        currency: { type: String, required: true },
        budget: { type: Number, required: true },
        budget_currency: { type: String, required: true },
        source_reference: { type: String, required: true },
        process_status: { type: String, required: true, default: 'pending' }
    },
    schemaOptions
);

export default mongoose.model<IRemittanceModel>('Remittance', RemittanceSchema);

export {
    IRemittance
}