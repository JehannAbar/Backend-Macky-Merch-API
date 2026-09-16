import express, { Request, Response } from 'express';

const app = express();

interface Product {
  id: number;
  name: string;
}

const users: Product[] = [
    { id: 1, name: 'Prod 1'},
    { id: 2, name: 'Prod 2'},
    { id: 3, name: 'Prod 3'}
];

app.get('/api/products', (req: Request, res: Response) => {
    const page: number = parseInt(req.query.page as string);
    const limit: number = parseInt(req.query.limit as string);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const resultUsers = users.slice(startIndex, endIndex);
    res.json(users);
})

app.listen(3000);