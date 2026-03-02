import cors from '@fastify/cors';
import fastify from 'fastify';
import { randomUUID } from 'node:crypto';

const server = fastify();

server.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
});

// --- In-memory storage ---
interface Product {
  id: string;
  nome: string;
  preco: number;
  descricao: string;
}

const products: Product[] = [];

// --- POST /products ---
server.post<{ Body: Omit<Product, 'id'> }>(
  '/products',
  async (request, reply) => {
    const { nome, preco, descricao } = request.body;

    if (!nome || preco == null || !descricao) {
      return reply
        .status(400)
        .send({ error: 'Campos obrigatórios: nome, preco, descricao' });
    }

    const product: Product = { id: randomUUID(), nome, preco, descricao };
    products.push(product);
    return reply.status(201).send(product);
  },
);

// --- GET /products?q=termo ---
server.get<{ Querystring: { q?: string } }>('/products', async (request) => {
  const q = request.query.q?.trim().toLowerCase();
  if (!q) return products;
  return products.filter(
    (p) =>
      p.nome.toLowerCase().includes(q) || p.descricao.toLowerCase().includes(q),
  );
});

// --- GET /products/:id ---
server.get<{ Params: { id: string } }>(
  '/products/:id',
  async (request, reply) => {
    const product = products.find((p) => p.id === request.params.id);
    if (!product) {
      return reply.status(404).send({ error: 'Produto não encontrado' });
    }
    return product;
  },
);

// --- PUT /products/:id ---
server.put<{ Params: { id: string }; Body: Omit<Product, 'id'> }>(
  '/products/:id',
  async (request, reply) => {
    const index = products.findIndex((p) => p.id === request.params.id);
    if (index === -1) {
      return reply.status(404).send({ error: 'Produto não encontrado' });
    }

    const { nome, preco, descricao } = request.body;
    if (!nome || preco == null || !descricao) {
      return reply
        .status(400)
        .send({ error: 'Campos obrigatórios: nome, preco, descricao' });
    }

    products[index] = { ...products[index], nome, preco, descricao };
    return products[index];
  },
);

// --- DELETE /products/:id ---
server.delete<{ Params: { id: string } }>(
  '/products/:id',
  async (request, reply) => {
    const index = products.findIndex((p) => p.id === request.params.id);
    if (index === -1) {
      return reply.status(404).send({ error: 'Produto não encontrado' });
    }

    const [removed] = products.splice(index, 1);
    return removed;
  },
);

server.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
