import { Router } from 'express';
import {
  listClinicalHistory,
  getClinicalHistory,
  createClinicalHistory
} from '../controllers/clinicalHistoryController';

const router = Router();

// GET /clinical-history
router.get('/', listClinicalHistory);

// GET /clinical-history/:id
router.get('/:id', getClinicalHistory);

// POST /clinical-history
router.post('/', createClinicalHistory);

export default router;

