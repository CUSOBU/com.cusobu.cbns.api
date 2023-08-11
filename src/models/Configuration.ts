import mongoose, { Document, Schema } from 'mongoose';
import IConf from '../interfaces/Configuration';

const schemaOptions = {
    timestamps: true, // assigns createdAt and updatedAt fields to the schema
    toJSON: { virtuals: true }, // allow to populate virtuals in every query
    toObject: { virtuals: true },
    versionKey: false
};

export interface IConfiguration extends IConf, Document {}

const ConfSchema: Schema = new Schema(
    {
        key: { type: String, required: true, unique: true },
        value: { type: String, default: '' }
    },
    schemaOptions
);

export default mongoose.model<IConfiguration>('Configuration', ConfSchema);

export {
    IConf
}