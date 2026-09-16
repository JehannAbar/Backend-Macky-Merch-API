import express, { Request, Response } from 'express';
import db from './db';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

const app = express();
app.use(express.json());

function isNegative(num: number) {
    return num < 0;
}

function isNotPositive(num: number) {
    return num <= 0;
}

function isEmptyString(str: string) {
    return str.trim() === '';
}

app.get('/api/products', async (req: Request, res: Response) => {
    try {
        const page: number = parseInt(req.query.page as string);
        const limit: number = parseInt(req.query.limit as string);

        if (page <= 0 || limit <= 0 || isNaN(page) || isNaN(limit)) {
            res.status(400).json({ message: 'Invalid values' });
            return;
        }

        const offset = (page - 1) * limit;

        const [paginatedResults] = await db.query<RowDataPacket[]>(
            `SELECT * FROM products LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        if (paginatedResults.length === 0) {
            res.status(404).json({ message: 'No products were found' });
            return;
        }

        res.status(200).json(paginatedResults);
    }
    catch {
        res.status(500).json({message: "Server error"})
    }
})

app.post('/api/products', async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const { name, price, stock, category, size, isAvailable } = body;

        if (!name || typeof name !== 'string' || isEmptyString(name)) {
            res.status(400).json({ message: 'Name is required and must be a non-empty string.' });
            return;
        }

        if (typeof price !== 'number' || isNotPositive(price)) {
            res.status(400).json({ message: 'Price is required and must be a positive number.' });
            return;
        }

        if (typeof stock !== 'number' || isNegative(stock)) {
            res.status(400).json({ message: 'Stock is required and cannot be negative.' });
            return;
        }

        if (!category) {
            res.status(400).json({ message: 'Category is required.' });
            return;
        }

        const [result] = await db.query<ResultSetHeader>(
            `INSERT INTO products (name, price, stock, category, size, isAvailable)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                name.trim(),
                price,
                stock,
                category,
                size ?? null,
                isAvailable ?? true,
            ]
        );

        const newProductId = result.insertId;
        const [newProduct] = await db.query<RowDataPacket[]>(
            'SELECT * FROM products WHERE id = ?',
            [newProductId]
        );

        res.status(201).json(newProduct[0]);
    }
    catch {
        res.status(500).json({ message: "Get request for products failed"})
    }
})

app.get('/api/products/:id', async (req: Request, res: Response) => {
    try {
        const productId = req.params.id;
        const [product] = await db.query<RowDataPacket[]>(
            `SELECT * FROM products WHERE id = ?`,
            [productId]
        );

        if (product.length === 0) {
            res.status(404).json({ error: 'Product not found.' });
            return;
        }

        res.status(200).json(product[0]);
    }
    catch {
        res.status(500).json({ message: "Get request for products failed"})
    }
})

app.put('/api/products/:id', async (req: Request, res: Response) => {
    try {
        const productId = req.params.id;
        const body = req.body; 

        if (!body || Object.keys(body).length === 0) {
            res.status(400).json({ error: 'Request body cannot be empty.' });
            return;
        }

        const { name, price, stock, category, size, isAvailable } = body            // Destructure

        if (name !== undefined && (typeof name !== 'string' || isEmptyString(name))) {
            res.status(400).json({ error: 'Name must be a non-empty string' });
            return;
        }

        if (price !== undefined && (typeof price !== 'number' || isNotPositive(price))) {
            res.status(400).json({ error: 'Price must be a positive number' });
            return;
        }

        if (stock !== undefined && (typeof stock !== 'number' || isNegative(stock))) {
            res.status(400).json({ error: 'Stock cannot be negative' });
            return;
        }

        const updated_details: string[] = [];
        const set_values: any[] = [];

        for (const [key, value] of Object.entries(body)) {
            updated_details.push(`${key} = ?`);
            set_values.push(value);
        } 

        set_values.push(productId);

        const [updated_obj] = await db.query<ResultSetHeader>(
            `UPDATE products
            SET ${updated_details.join(', ')}
            WHERE id = ?`,
            set_values
        );

        if (updated_obj.affectedRows === 0) {
            res.status(404).json({ error: 'Product was unable to be updated.' });
            return;
        }

        const [new_object] = await db.query<RowDataPacket[]>(`SELECT * FROM products WHERE id = ?`, [productId]);
        res.status(200).json(new_object[0]);
    }
    catch {
        res.status(500).json({ message: "Get request for products failed"})
    }
})

app.delete('/api/products/:id', async (req: Request, res: Response) => {
    try {
        const productId = req.params.id;
        const [deleted_obj] = await db.query<ResultSetHeader>(
            `DELETE FROM products WHERE id = ?`,
            [productId]
        );

        if (deleted_obj.affectedRows === 0) {
            res.status(404).json({ error: 'Product not found.' });
            return;
        }

        res.status(200).json({message: "Product deleted successfully"});
    }
    catch {
        res.status(500).json({ message: "Get request for products failed"})
    }
})


if (require.main === module) {
  app.listen(3000)
}

export default app;