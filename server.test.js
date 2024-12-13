const request = require('supertest');
const app = require('./server');
const mongoose = require('mongoose');
const path = require('path');

describe('POST /upload', () => {
    let server;

    beforeAll(() => {
        server = app.listen(4001);
    });

    afterAll(async () => {
        await mongoose.connection.close();
        server.close();
    });

    it('should upload a valid image file', async () => {
        const response = await request(server)
            .post('/upload')
            .attach('image', path.resolve(__dirname, 'test-image.jpg'));
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Image uploaded successfully');
    });

    it('should upload a valid DICOM file', async () => {
        const response = await request(server)
            .post('/upload')
            .attach('image', path.resolve(__dirname, 'test-image.dcm'));
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Image uploaded successfully');
    });

    it('should return an error for unsupported file type', async () => {
        const response = await request(server)
            .post('/upload')
            .attach('image', path.resolve(__dirname, 'test-image.txt'));
        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/Only images and DICOM files are allowed/);
    });

    it('should return an error if no file is uploaded', async () => {
        const response = await request(server).post('/upload');
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('No image uploaded');
    });

    it('should return an error if file size exceeds limit', async () => {
        const largeFile = path.resolve(__dirname, 'large-image.jpg'); // Assume this file exceeds 10MB
        const response = await request(server)
            .post('/upload')
            .attach('image', largeFile);
        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/File too large/);
    });
});
