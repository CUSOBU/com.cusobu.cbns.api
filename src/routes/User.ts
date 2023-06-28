import { Router } from 'express';
import controller from '../controllers/User';
import { Schemas, ValidateSchema } from '../middleware/ValidateSchema';
import { verifyJWT, authorizeRole } from '../middleware/AuthMiddleware';

const router = Router();

router.post('/', verifyJWT, ValidateSchema(Schemas.user.create), controller.create);
router.get('/:email',  verifyJWT, controller.getOne);

router.patch('/:email', verifyJWT, authorizeRole('seller'), ValidateSchema(Schemas.user.update), controller.update);
router.delete('/:email', verifyJWT, controller.deleteOne);

router.get('/', verifyJWT, authorizeRole('admin'),  controller.search);

export = router;
