import { Router } from 'express';
import controller from '../controllers/ProviderBalance';
import { Schemas, ValidateSchema } from '../middleware/ValidateSchema';
import { verifyJWT, authorizeRole } from '../middleware/AuthMiddleware';

const router = Router();

// router.get('/', verifyJWT, authorizeRole(["admin"]), controller.getAll)
// router.get('/:email', verifyJWT, controller.getOne)

router.patch('/:email', verifyJWT, authorizeRole(['admin']), controller.update);
router.post('/budget/', verifyJWT, authorizeRole(['provider']),controller.postBudget);
router.post('/', verifyJWT, authorizeRole(['admin']), ValidateSchema(Schemas.balance.create), controller.create);

export = router;
