import type { VercelRequest, VercelResponse } from '@vercel/node';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import cors from 'cors';
import { createRouter } from '../server/routes';

// Initialize database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// CORS middleware
const corsMiddleware = cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  await new Promise((resolve) => corsMiddleware(req, res, resolve));

  try {
    // Get the path from the request
    const path = req.url?.split('/api/')[1] || '';
    const method = req.method?.toLowerCase() || 'get';

    // Create router with database instance
    const router = createRouter(db);
    
    // Handle the route
    const handler = router[path]?.[method];
    if (handler) {
      await handler(req, res);
    } else {
      res.status(404).json({ error: 'Route not found' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
} 