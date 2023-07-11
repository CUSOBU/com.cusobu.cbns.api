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
        email: { type: String, required: true },
        full_name: { type: String, required: true },
        phone_number: { type: String, required: true },
        cardNumber: { type: String, required: true },   
        remittance_amount: { type: Number, required: true },
        remittance_currency: { type: String, required: true },
        budget_amount: { type: Number, required: true },
        operation_cost: { type: Number, required: true },
        budget_currency: { type: String, required: true },
        source_reference: { type: String },
        status: { type: String, required: true, default: 'pending' },
        statusCode: { type: String, required: true, default: '0' },
        webhook: { type: String },
        evidence: { type: String },
        details: { type: String },
        provider: { type: String }
    },
    schemaOptions
);

export default mongoose.model<IRemittanceModel>('Remittance', RemittanceSchema);

export {
    IRemittance
}