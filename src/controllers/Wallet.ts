import { Response, Request, NextFunction } from 'express';
import Wallet, { IWallet } from '../models/Wallet';

const create = (req: Request, res: Response, next: NextFunction) => {
    const { name, user } = req.body;

    const wallet = new Wallet({ name, user });

    return wallet
        .save()
        .then((wallet: IWallet) => res.status(201).json({ wallet }))
        .catch((error) => res.status(500).json({ error }));
};

const getOne = (req: Request, res: Response, next: NextFunction) => {
    const walletId = req.params.id;

    return Wallet.findById(walletId)
        .then((wallet) => (wallet ? res.status(200).json({ wallet }) : res.status(404).json({ message: 'Not found' })))
        .catch((error) => res.status(500).json({ error }));
};

const search = (req: Request, res: Response, next: NextFunction) => {
    return Wallet.find()
        .then((wallets) => res.status(200).json({ wallets }))
        .catch((error) => res.status(500).json({ error }));
};

const update = (req: Request, res: Response, next: NextFunction) => {
    const walletId = req.params.id;
    return Wallet.findOneAndUpdate({ _id: walletId }, req.body)
        .then((wallet) => (wallet ? res.status(201).json({ wallet }) : res.status(404).json({ message: 'Not found' })))
        .catch((error) => res.status(500).json({ error }));
};

const deleteOne = (req: Request, res: Response, next: NextFunction) => {
    const walletId = req.params.id;
    return Wallet.findByIdAndDelete(walletId)
        .then((wallet) => (wallet ? res.status(201).json({ message: 'deleted' }) : res.status(404).json({ message: 'Not found' })))
        .catch((error) => res.status(500).json({ error }));
};

export default {
    create,
    getOne,
    search,
    update,
    deleteOne
};
