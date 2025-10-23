import { Router } from 'express';
import routes from '../controllers/authController';

const router = Router();

// POST /auth to create a new user
// This route is typically used for user registration
router.post('/', routes.createUser);

// PUT /auth/:id to update an existing user
// This route is typically used for updating user details
router.put('/:id', routes.updateUser);




//router.get('/:id/picture', routes.getUser);
//router.post('/:id/picture', routes.getUser);
//router.delete('/:id/picture', routes.getUser);


export default router;
