// create a test for the auth routes
// using Jest and Supertest
import request from 'supertest';
import express from 'express';

import AuthService from '../../src/services/authService';
import userRoutes from '../../src/routes/user.routes';

jest.mock('../../src/services/authService');
const mockedAuthService = AuthService as jest.Mocked<typeof AuthService>;

const app = express();
app.use(express.json());
app.use('/users', userRoutes);

describe('Auth Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('/ to create a new user', async () => {
        const newUser = {
            username: 'newuser',
            password: 'newpassword123',
            email: 'a@a.com',
            first_name: 'First',
            last_name: 'Last'
        };
        mockedAuthService.createUser.mockResolvedValue(newUser as any);
        const response = await request(app)
            .post('/users')
            .send(newUser);
        expect(response.status).toBe(201);
        expect(response.body).toEqual(newUser);
    });

    it('/users to create a new user errors', async () => {
        mockedAuthService.createUser.mockRejectedValue(new Error('User already exists'));
        const response = await request(app)
            .post('/users')
            .send({
                username: 'existinguser',
                password: 'password123',
                email: 'a@a.com',
                first_name: 'First',
                last_name: 'Last'
            });
        expect(response.status).toBe(500);
    });

});