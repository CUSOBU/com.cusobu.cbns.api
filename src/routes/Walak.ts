import { Router } from 'express';
import controller from '../controllers/Remittance';
import walak from '../services/WalakAPI';

const router = Router();

router.post('/mlc/:hook', walak.updateStatusNotification);

export = router;