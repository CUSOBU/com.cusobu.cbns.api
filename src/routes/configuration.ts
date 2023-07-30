import { Router } from 'express';
import controller from '../controllers/Configuration';
import { verifyJWT, authorizeRole } from '../middleware/AuthMiddleware';

const router = Router();

router.patch('/:key', verifyJWT, authorizeRole(['admin']), controller.updateConfiguration);
router.post('/', verifyJWT, authorizeRole(['admin']), controller.create);
router.get('/', verifyJWT, authorizeRole(['admin']), controller.getConfigurations);
router.delete('/:key', verifyJWT, authorizeRole(['admin']), controller.deleteConfiguration);

router.get('/:key', verifyJWT, authorizeRole(['admin']), controller.getConfigurationByKey);

export = router;