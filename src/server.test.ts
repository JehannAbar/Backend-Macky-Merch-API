import request from 'supertest';
import app from './server'
import db from './db';

jest.mock('./db', () => ({
  query: jest.fn(),
}));

const mockDbQuery = db.query as jest.Mock;

describe('Products API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    if (db && typeof db.end === 'function') {
      await db.end();
    }
  });

  describe('GET /api/products', () => {
    it('should return paginated products on valid query parameters', async () => {
      const mockProducts = [
        { id: 1, name: 'Shirt', price: 20, stock: 10, category: 'Apparel' },
      ];
      mockDbQuery.mockResolvedValueOnce([mockProducts]);

      const res = await request(app).get('/api/products?page=1&limit=10');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockProducts);
      expect(mockDbQuery).toHaveBeenCalledWith(
        'SELECT * FROM products LIMIT ? OFFSET ?',
        [10, 0]
      );
    });

    it('should return 400 for invalid page or limit parameters', async () => {
      const res = await request(app).get('/api/products?page=0&limit=-5');

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Invalid values' });
    });

    it('should return 404 when no products are found', async () => {
      mockDbQuery.mockResolvedValueOnce([[]]);

      const res = await request(app).get('/api/products?page=1&limit=10');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: 'No products were found' });
    });

    it('should return 500 when database throws an error', async () => {
      mockDbQuery.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app).get('/api/products?page=1&limit=10');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: 'Server error' });
    });
  });

  describe('POST /api/products', () => {
    const validProductPayload = {
      name: 'Hoodie',
      price: 49.99,
      stock: 15,
      category: 'Apparel',
      size: 'L',
      isAvailable: true,
    };

    it('should create a product and return 201 with the created object', async () => {
      const createdProduct = { id: 10, ...validProductPayload };
      mockDbQuery.mockResolvedValueOnce([{ insertId: 10 }]);
      mockDbQuery.mockResolvedValueOnce([[createdProduct]]);

      const res = await request(app)
        .post('/api/products')
        .send(validProductPayload);

      expect(res.status).toBe(201);
      expect(res.body).toEqual(createdProduct);
      expect(mockDbQuery).toHaveBeenCalledTimes(2);
    });

    it('should return 400 when name is missing or invalid', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({ ...validProductPayload, name: '' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        message: 'Name is required and must be a non-empty string.',
      });
    });

    it('should return 400 when price is non-positive', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({ ...validProductPayload, price: 0 });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        message: 'Price is required and must be a positive number.',
      });
    });

    it('should return 400 when stock is negative', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({ ...validProductPayload, stock: -1 });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        message: 'Stock is required and cannot be negative.',
      });
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a single product by ID', async () => {
      const mockProduct = { id: 1, name: 'Mug', price: 12.99 };
      mockDbQuery.mockResolvedValueOnce([[mockProduct]]);

      const res = await request(app).get('/api/products/1');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockProduct);
    });

    it('should return 404 if product does not exist', async () => {
      mockDbQuery.mockResolvedValueOnce([[]]);

      const res = await request(app).get('/api/products/999');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Product not found.' });
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update product details successfully', async () => {
      const updateData = { name: 'Updated Shirt', price: 25.0 };
      const updatedProduct = { id: 1, ...updateData, stock: 5, category: 'Apparel' };

      mockDbQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
      mockDbQuery.mockResolvedValueOnce([[updatedProduct]]);

      const res = await request(app)
        .put('/api/products/1')
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(updatedProduct);
    });

    it('should return 400 when updating with an empty body', async () => {
      const res = await request(app).put('/api/products/1').send({});

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Request body cannot be empty.' });
    });

    it('should return 404 if no rows were updated', async () => {
      mockDbQuery.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const res = await request(app)
        .put('/api/products/999')
        .send({ name: 'Valid Name' });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Product was unable to be updated.' });
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete a product successfully', async () => {
      mockDbQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app).delete('/api/products/1');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Product deleted successfully' });
    });

    it('should return 404 if product to delete is not found', async () => {
      mockDbQuery.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const res = await request(app).delete('/api/products/999');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Product not found.' });
    });
  });
});