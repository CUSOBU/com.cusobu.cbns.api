import { Router } from 'express';
import controller from '../controllers/Remittance';
import { Schemas, ValidateSchema } from '../middleware/ValidateSchema';

const router = Router();

router.post('/', ValidateSchema(Schemas.remittance.create), controller.create);

router.get('/', controller.search);

router.get('/:id', controller.getOne);

router.post('/filter', controller.filter);

router.patch('/:id', ValidateSchema(Schemas.remittance.update), controller.update);

export = router;