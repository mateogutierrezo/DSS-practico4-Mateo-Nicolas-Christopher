import { Router } from 'express';
import routes from '../controllers/invoiceController';

const router = Router();

// GET /invoices
router.get('/', routes.listInvoices);

// GET /invoices
router.get('/:id', routes.getInvoice);

// POST /invoices/:id/pay
router.post('/:id/pay', routes.setPaymentCard);
router.get('/:id/invoice', routes.getInvoicePDF);

export default router;
