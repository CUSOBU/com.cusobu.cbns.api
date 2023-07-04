import { Router } from 'express';
import controller from '../controllers/Remittance';
import { Schemas, ValidateSchema } from '../middleware/ValidateSchema';
import { verifyJWT, authorizeRole } from '../middleware/AuthMiddleware';


//Passports
import passport from 'passport';
import { generateJWT } from '../middleware/AuthMiddleware';


const router = Router();

router.post('/', verifyJWT, ValidateSchema(Schemas.remittance.create), controller.create);

router.post('/pricing', verifyJWT, authorizeRole(["seller", "admin"]), controller.getRemittancePrice);

router.get('/', verifyJWT, controller.search);

router.get('/:id', verifyJWT, controller.getOne);

router.post('/filter', verifyJWT, controller.filter);

router.patch('/:id', verifyJWT, ValidateSchema(Schemas.remittance.update), controller.update);
router.post('/setstatus/:id', verifyJWT, ValidateSchema(Schemas.remittance.update), controller.setStatusProvider);

export = router;