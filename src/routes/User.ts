import { Router } from 'express';
import controller from '../controllers/User';
import { Schemas, ValidateSchema } from '../middleware/ValidateSchema';
import { verifyJWT, authorizeRole } from '../middleware/AuthMiddleware';

const router = Router();

router.post('/', verifyJWT, authorizeRole(["admin"]), ValidateSchema(Schemas.user.create), controller.create);
router.get('/:email',  verifyJWT, authorizeRole(["admin"]), controller.getOne);

router.patch('/:email', verifyJWT, authorizeRole(["admin"]), ValidateSchema(Schemas.user.update), controller.update);
router.delete('/:email', verifyJWT, authorizeRole(["admin"]), controller.deleteOne);

router.get('/', verifyJWT, authorizeRole(["admin"]),  controller.search);

export = router;
