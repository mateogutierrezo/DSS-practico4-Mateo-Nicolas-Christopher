import { Router } from 'express';
import routes from '../controllers/authController';

const router = Router();

router.get('/', routes.ping);

router.post('/login', routes.login);

// POST /auth/forgot-password
router.post('/forgot-password', routes.forgotPassword);

// POST /auth/reset-password
router.post('/reset-password', routes.resetPassword);

// POST /auth/set-password
router.post('/set-password', routes.setPassword);


export default router;
