import { Router } from 'express'
import controller from '../controllers/Statistics'
import { Schemas, ValidateSchema } from '../middleware/ValidateSchema'
import { verifyJWT, authorizeRole } from '../middleware/AuthMiddleware';

const router = Router()

router.get('/', verifyJWT, controller.getBalance);
router.get('/:email', verifyJWT, authorizeRole(["admin"]), controller.getBalance);

export = router;