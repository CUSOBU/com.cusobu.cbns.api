import { Router } from 'express'
import { verifyJWT, authorizeRole } from '../middleware/AuthMiddleware';
import controller from '../controllers/Topups/TopupOrder'

const router = Router()

router.post('/', verifyJWT, controller.create);
router.patch('/:id', verifyJWT, controller.patchTopupOrder);
router.delete('/:id', verifyJWT, controller.deleteTopupOrder);
router.post('/filter', verifyJWT, controller.filter);

router.post('/setstatus/:id', verifyJWT, controller.setStatus);

router.get('/:id', verifyJWT, controller.getTopupOrder);


// router.patch('/:id', verifyJWT, controller.patchTopup);
// router.delete('/:id', verifyJWT, controller.deleteTopup);


export = router;