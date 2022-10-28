import { Router } from 'express';
import controller from '../controllers/Wallet';
import { Schemas, ValidateSchema } from '../middleware/ValidateSchema';

const router = Router();

router.post('/create', ValidateSchema(Schemas.wallet.create), controller.create);
router.get('/:id', controller.getOne);
router.get('/', controller.search);
router.patch('/:id', ValidateSchema(Schemas.wallet.update), controller.update);
router.delete('/:id', controller.deleteOne);

export = router;
