import express, { Request, Response } from 'express';
import db from './db';

const app = express();

function isNegative(num: number) {
    if (num > 0) {
        return false;
    }
    return true;
}

app.get('/api/products', async (req: Request, res: Response) => {
    try {
        // Returns an array of Row Data Packets
        const [results] = await db.query(
            `SELECT * FROM products`
        );

        if (!Array.isArray(results) || results.length === 0) {
            res.status(404).json({ message: "No products were found" });
            return;
        }

        res.status(200).json(results);
    }
    catch {
        res.status(500).json({message: "Server error"})
    }
})

app.post('/api/products', async (req: Request, res: Response) => {
    try {
        const page: number = parseInt(req.query.page as string);
        const limit: number = parseInt(req.query.limit as string);

        if (isNegative(page) || isNegative(limit) || isNaN(page) || isNaN(limit)) {
            res.status(400).json({message: "Invalid values"});
            return;
        }

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const [paginatedResults] = await db.query(
            `SELECT * FROM products LIMIT ? OFFSET ?`,
            [limit, startIndex]
        );

        res.status(201).json(paginatedResults);
    }
    catch {
        res.status(500).json({ message: "Get request for products failed"})
    }
})

app.get('/api/products/:id', async (req: Request, res: Response) => {
    try {
        const productId = req.params.id;
        const product = await db.query(
            `SELECT * FROM products WHERE id = ?`,
            [productId]
        );

        if (!product) {
            res.status(404).json({ error: 'Product not found.' });
            return;
        }

        res.status(200).json(product);
    }
    catch {
        res.status(500).json({ message: "Get request for products failed"})
    }
})

app.put('/api/products/:id', async (req: Request, res: Response) => {
    try {
        const productId = req.params.id;
        const body = req.body; 
        const { name, price, stock, category, size, isAvailable } = body            // Destructure

        if (price <= 0) {
            res.status(400).json({ error: 'Price must be a positive number.' });
            return;
        }
        if (stock < 0) {
            res.status(400).json({ error: 'Stock cannot be negative.' });
            return;
        }

        const updated_details: string[] = [];

        for (const [key, value] of Object.entries(body)) {
            updated_details.push(`${key} = ?`);
        } 

        const updated_obj = await db.query(
            `UPDATE products
            SET ${updated_details.join(', ')}
            WHERE id = ?`,
            [productId]
        );

        if (!updated_obj) {
            res.status(404).json({ error: 'Product was unable to be updated.' });
            return;
        }

        const new_object = await db.query(`SELECT * FROM products WHERE id = ?`, [productId]);
        res.status(200).json(new_object);
    }
    catch {
        res.status(500).json({ message: "Get request for products failed"})
    }
})

app.delete('/api/products/:id', async (req: Request, res: Response) => {
    try {
        const productId = req.params.id;
        const deleted_obj = await db.query(
            `DELETE 
            FROM products
            WHERE id = ?`,
            [productId]
        );

        if (!deleted_obj) {
            res.status(404).json({ error: 'Product not found or is null.' });
            return;
        }

        res.status(200).json({message: "Product deleted successfully"});
    }
    catch {
        res.status(500).json({ message: "Get request for products failed"})
    }
})

app.listen(3000);