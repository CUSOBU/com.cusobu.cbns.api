import { Router } from 'express';
import controller from '../controllers/User';
import { Schemas, ValidateSchema } from '../middleware/ValidateSchema';

const router = Router();

router.post('/', ValidateSchema(Schemas.user.create), controller.create);
router.get('/:email', controller.getOne);
router.get('/', controller.search);
router.patch('/:id', ValidateSchema(Schemas.user.update), controller.update);
router.delete('/:id', controller.deleteOne);

export = router;
