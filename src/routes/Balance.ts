import { Router } from 'express'
import controller from '../controllers/Balance'
import { Schemas, ValidateSchema } from '../middleware/ValidateSchema'
import { verifyJWT, authorizeRole } from '../middleware/AuthMiddleware';

const router = Router()

router.get('/', verifyJWT, controller.getAll)
router.get('/:email', verifyJWT, controller.getOne)
router.patch('/:email', verifyJWT, controller.update)
router.post('/', verifyJWT, ValidateSchema(Schemas.balance.create), controller.create)

export = router;