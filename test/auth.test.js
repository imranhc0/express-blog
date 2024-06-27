const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const User = require('../model/user');
const authRoutes = require('../routes/user');
const saltRounds = 10;

const app = express();
app.use(express.json());
app.use('/api/v1/user', authRoutes);

describe('Auth APIs', () => {
    beforeAll(async () => {
        // Clear the User collection before tests
        await User.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.disconnect();
    });

    describe('POST api/v1/user/signup', () => {
        test('should signup a new user', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/v1/user/signup')
                .send(userData);

            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('token');
        });

        test('should return 400 on invalid data', async () => {
            const invalidUserData = {
                firstName: 'J',
                lastName: 'D',
                email: 'john.doe',
                password: 'pass'
            };

            const response = await request(app)
                .post('/api/v1/user/signup')
                .send(invalidUserData);

            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty('msg', 'Invalid data');
        });

        test('should return 409 if email already exists', async () => {
            const existingUser = new User({
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'jane.doe@example.com',
                password: await bcrypt.hash('password123', saltRounds)
            });
            await existingUser.save();

            const duplicateUserData = {
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'jane.doe@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/v1/user/signup')
                .send(duplicateUserData);

            expect(response.statusCode).toBe(409);
            expect(response.body).toHaveProperty('msg', 'Email already in use');
        });
    });

    describe('POST api/v1/user/login', () => {
        test('should login with correct credentials', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example33.com',
                password: 'password12333'
            };
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
            const user = new User({ ...userData, password: hashedPassword });
            await user.save();

            const response = await request(app)
                .post('/api/v1/user/login')
                .send({ email: userData.email, password: userData.password });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('token');
        });

        test('should return 400 on invalid data', async () => {
            const invalidLoginData = {
                email: 'john.doe',
                password: 'pass'
            };

            const response = await request(app)
                .post('/api/v1/user/login')
                .send(invalidLoginData);

            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty('msg', 'Invalid data');
        });

        test('should return 404 if user does not exist', async () => {
            const nonExistentUserData = {
                email: 'nonexistent@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/v1/user/login')
                .send(nonExistentUserData);

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty('msg', 'User Not found');
        });

        test('should return 400 if password is incorrect', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example444.com',
                password: 'password1234444'
            };
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
            const user = new User({ ...userData, password: hashedPassword });
            await user.save();

            const incorrectPasswordData = {
                email: userData.email,
                password: 'incorrectpass'
            };

            const response = await request(app)
                .post('/api/v1/user/login')
                .send(incorrectPasswordData);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('msg', 'Password is not valid');
        });
    });
});
