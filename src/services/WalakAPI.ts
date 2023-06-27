import { Response, Request, NextFunction } from 'express';
import Remittance, { IRemittance } from '../models/Remittance';
import axios from 'axios';
import {config} from '../config/config'; 
import codificator from '../common/Codification';

const WALAK_API_URL= "https://api.dev.walak.app/api/mlc";
const WALAK_API_KEY= "yVasDgAmcnbkiquign0XdvrehxdAPhPPf6R5jC9M8tDbN8B0PmOamVV7x7OnUGBgkC1c0+wIsd1r6UJk7+L54oXH6OXay1maBimxOs4oQz3mNNn4McKIr9VX6H64Y1dNKQ4WpA==";
   

const updateStatusNotification = async (req: Request, res: Response, next: NextFunction) => {

    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'Request body must not be empty' });
    }

    const hook = req.params.hook;
    const cardRequested = req.body.cardNumber;

    const remittanceId = hook.split("-")[0];
    const cardNumber = hook.split("-")[1];

    if (cardRequested !== codificator.decrypt(cardNumber)) {
        return res.status(400).json({ message: 'Card hook and cardNumber are differents' });
    }

    let remittance = await Remittance.findOne({ identifier: remittanceId, cardNumber: cardNumber });

    if (!remittance) {
        return res.status(404).json({ message: 'Not found' });
    }

    remittance = await Remittance.findOneAndUpdate({ identifier: remittanceId}, {status: req.body.status, statusCode: req.body.statusCode});

    return res.status(200).json({ message: 'Updated', remittance: remittance });

};

// let remittanceWalak = { user_email, cardNumber, full_name, phone_number, remittance_amount, webhook };

const postRemittance = async (data: any) => {

    let remittanceData:any = {};
    remittanceData.cardNumber = data.cardNumber ;
    remittanceData.amount = data.remittance_amount;
    remittanceData.senderName = data.full_name;
    remittanceData.phoneNumber = data.phone_number;
    remittanceData.webhook = data.webhook;

    try {
        const response = await axios.post(WALAK_API_URL, remittanceData, {
            headers: { 'X-API-KEY': WALAK_API_KEY }
        });

        if (response.status !== 200) {
            throw new Error('Failed to register remittance with other API');
        }

        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }  
};

export default {
    postRemittance,
    updateStatusNotification
}

