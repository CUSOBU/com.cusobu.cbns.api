import { Router } from 'express'
import controller from '../controllers/Balance'
import { Schemas, ValidateSchema } from '../middleware/ValidateSchema'
import auth from '../middleware/AuthMiddleware'
import passport from 'passport';


const router = Router()

router.get('/',
  passport.authenticate('jwt', { session: false }));

  router.post('/login', auth.generateJWT);

export default router;