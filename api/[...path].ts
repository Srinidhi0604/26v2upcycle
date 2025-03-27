import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

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

    // Example route handler using Supabase
    if (path === 'products' && method === 'get') {
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) throw error;
      return res.status(200).json(data);
    }

    // Add more route handlers here...

    // Default 404 response
    res.status(404).json({ error: 'Route not found' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
} 