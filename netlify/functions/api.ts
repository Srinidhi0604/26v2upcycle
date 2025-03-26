import express from 'express';
import type { Express } from 'express';
import type { Handler, HandlerEvent, HandlerContext, HandlerResponse } from '@netlify/functions';
import type { Request, Response, NextFunction } from 'express';
import serverless from 'serverless-http';
import { registerRoutes } from '../../server/routes';
import session from 'express-session';
import type { CorsOptions } from 'cors';
import cors from 'cors';
import fileUpload from 'express-fileupload';

// Create Express app
const app: Express = express();

// Configure middleware
const corsOptions: CorsOptions = {
  origin: process.env.SITE_URL || 'http://localhost:5173',
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(fileUpload());

// Configure session
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Register all routes
registerRoutes(app);

// Export the serverless handler
export const handler: Handler = async (event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> => {
  const handler = serverless(app);
  const result = await handler(event, context) as any;
  return {
    statusCode: result.statusCode || 200,
    body: typeof result.body === 'string' ? result.body : JSON.stringify(result.body || {}),
    headers: {
      ...(result.headers || {}),
      'Content-Type': 'application/json'
    }
  };
}; 