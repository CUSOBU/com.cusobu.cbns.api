import { Response, Request, NextFunction } from 'express';
import User, { IUser } from '../models/User';

const create = (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.body;

    const user = new User({ name });

    return user
        .save()
        .then((user: IUser) => res.status(201).json({ user }))
        .catch((error) => res.status(500).json({ error }));
};

const getOne = (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;

    return User.findById(userId)
        .then((user) => (user ? res.status(200).json({ user }) : res.status(404).json({ message: 'Not found' })))
        .catch((error) => res.status(500).json({ error }));
};

const search = (req: Request, res: Response, next: NextFunction) => {
    return User.find()
        .then((users) => res.status(200).json({ users }))
        .catch((error) => res.status(500).json({ error }));
};

const update = (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    return User.findOneAndUpdate({ _id: userId }, req.body)
        .then((user) => (user ? res.status(201).json({ user }) : res.status(404).json({ message: 'Not found' })))
        .catch((error) => res.status(500).json({ error }));
};

const deleteOne = (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    return User.findByIdAndDelete(userId)
        .then((user) => (user ? res.status(201).json({ message: 'deleted' }) : res.status(404).json({ message: 'Not found' })))
        .catch((error) => res.status(500).json({ error }));
};

export default {
    create,
    getOne,
    search,
    update,
    deleteOne
};
