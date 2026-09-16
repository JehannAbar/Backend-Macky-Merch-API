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
            `SELECT * FROM PRODUCTS`
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

app.listen(3000);