import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User, { IUser } from '../models/User';
import {config} from '../config/config';
import { string } from 'joi';
import { authorize } from 'passport';

// Custom JWT authentication middleware
export async function verifyJWT(req: Request, res: Response, next: NextFunction) {
  if (req.headers) {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(400).json({ error: 'No token provided' });
    }

    return jwt.verify(token, config.SECRET_KEY, async (err: any, decoded: any) => {
      if (err) {
        return res.status(400).json({ error: err });
      }

      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(400).json({ error: 'The user of the token does not exists' });
      }

      req.body.email = user.email;

      if (!user) {
        return res.status(400).json({ error: 'User not exists' });
      }

      console.log('User authenticated', req.body);
      next();
    });
  }
  return res.status(400).json({ error: 'No headers provided' });
}

export const authorizeRole = (role: string) => (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;

    if (!token) {
      return res.status(400).json({ error: 'No token provided' });
    }
    
    return jwt.verify(token, config.SECRET_KEY, async (err: any, decoded: any) => {
      if(decoded.role !== role) {
        return res.status(403).send('No tienes permiso para realizar esta acción');
      }else{
        return next();
      }
    });
}

export async function generateJWT(req: Request, res: Response) {
  if (req.headers) {
    const token = req.headers.authorization;

    if (token) {
      return res.status(400).json({ error: 'A token already exists' });
    }

    const { email  } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(401).json({ error: 'Failed to login, invalid user/password'});
    }

    const passwordIsValid = await bcrypt.compare(req.body.password, user.password);

    if (!passwordIsValid) {
      return res.status(401).json({ error: 'Failed to login, invalid user/password'});
    }

    const { id } = user;

    const newToken = jwt.sign({ id }, config.SECRET_KEY, { expiresIn: '1d' });

    return res.status(200).json({token_jwt: newToken, email: user.email, roles: user.role});
  }
  return res.status(401).json({ error: 'No headers provided' });
}

export default { verifyJWT, generateJWT, authorizeRole };

