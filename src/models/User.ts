import mongoose, { Document, Schema } from 'mongoose';
import IUser from '../interfaces/user';

const schemaOptions = {
    timestamps: true, // assigns createdAt and updatedAt fields to the schema
    toJSON: { virtuals: true }, // allow to populate virtuals in every query
    toObject: { virtuals: true },
    versionKey: false
};

export interface IUserModel extends IUser, Document {}

const UserSchema: Schema = new Schema(
    {
        email: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        password: { type: String, required: true },
        role: { type: String, enum: ['seller', 'admin', 'provider'], default: 'seller' }
    },
    schemaOptions
);

export default mongoose.model<IUserModel>('User', UserSchema);

export {
    IUser
}
