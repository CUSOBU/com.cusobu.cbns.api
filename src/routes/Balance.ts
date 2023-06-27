import { Router } from 'express'
import controller from '../controllers/Balance'
import { Schemas, ValidateSchema } from '../middleware/ValidateSchema'
import { route } from './User'

const router = Router()

router.get('/', controller.getAll)
router.get('/:email', controller.getOne)
router.patch('/:email', controller.update)
router.post('/', ValidateSchema(Schemas.balance.create), controller.create)

export = router;