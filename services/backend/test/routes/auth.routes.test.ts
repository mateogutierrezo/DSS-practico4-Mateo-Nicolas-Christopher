// create a test for the auth routes
// using Jest and Supertest
import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/routes/auth.routes';
import jwtUtils from '../../src/utils/jwt';
import AuthService from '../../src/services/authService';

jest.mock('../../src/services/authService');
const mockedAuthService = AuthService as jest.Mocked<typeof AuthService>;

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('/login', async () => {
        const jwtSecret = jwtUtils.generateToken('1');
        mockedAuthService.authenticate.mockResolvedValue({ id: '1', username: 'testuser' } as any);
        mockedAuthService.generateJwt.mockReturnValue(jwtSecret);

        const response = await request(app)
            .post('/auth/login')
            .send({ username: '1', password: 'password123' });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body.token).toBe(jwtSecret);
    });

    it('/login errors', async () => {
        mockedAuthService.authenticate.mockRejectedValue(new Error('Invalid username or not activated'));
        const response = await request(app)
            .post('/auth/login')
            .send({ username: '1', password: 'wrongpassword' });
        expect(response.status).toBe(500);
    });

    it('/forgot-password', async () => {
        mockedAuthService.sendResetPasswordEmail.mockResolvedValue(undefined);
        const response = await request(app)
            .post('/auth/forgot-password')
            .send({ email: 'a@a.com' });
        expect(response.status).toBe(204);
    });

    it('/forgot-password errors', async () => {
        mockedAuthService.sendResetPasswordEmail.mockRejectedValue(new Error('No user with that email or not activated'));
        const response = await request(app)
            .post('/auth/forgot-password')
            .send({ email: 'a@a.com' });
        expect(response.status).toBe(500);
    });

    it('/reset-password', async () => {
        mockedAuthService.resetPassword.mockResolvedValue(undefined);
        const response = await request(app)
            .post('/auth/reset-password')
            .send({ token: 'valid-token', newPassword: 'newpassword123' });
        expect(response.status).toBe(204);
    });

    it('/reset-password errors', async () => {
        mockedAuthService.resetPassword.mockRejectedValue(new Error('Invalid or expired reset token'));
        const response = await request(app)
            .post('/auth/reset-password')
            .send({ token: 'invalid-token', newPassword: 'newpassword123' });
        expect(response.status).toBe(500);
    });

    it('/set-password', async () => {
        mockedAuthService.setPassword.mockResolvedValue(undefined);
        const response = await request(app)
            .post('/auth/set-password')
            .send({ token: 'valid-invite-token', newPassword: 'newpassword123' });
        expect(response.status).toBe(204);
    });

    it('/set-password errors', async () => {
        mockedAuthService.setPassword.mockRejectedValue(new Error('Invalid or expired invite token'));
        const response = await request(app)
            .post('/auth/set-password')
            .send({ token: 'invalid-invite-token', newPassword: 'newpassword123' });
        expect(response.status).toBe(500);
    });
});