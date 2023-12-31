import { Response, Request, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import {config} from '../config/config';


const saltRounds = 10;

const create = (req: Request, res: Response, next: NextFunction) => {
    
    const { name, password, role } = req.body;
    const email=req.body.email
    // encriptar la contraseña
    bcrypt.hash(password, saltRounds, function(err, hash) {
        if(err) {
            return res.status(500).json({ error: err });
        }
        const user = new User({ name, email, password: hash, role });

        return user
            .save()
            .then((user: IUser) => res.status(201).json({ user }))
            .catch((error) => res.status(400).json({ error }));
    });

};

const getOne = (req: Request, res: Response, next: NextFunction) => {
    return User.findOne({email: req.query.email})
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

const generateToken = (userId: string) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || config.SECRET_KEY, {
      expiresIn: '1h',
    });
  };

const comparePassword = async (password: string, user: IUser) => {
    return await bcrypt.compare(password, user.password);
};

export default {
    create,
    getOne,
    search,
    update,
    deleteOne,
    generateToken,
    comparePassword
};
