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
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

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
  // Log incoming request for debugging
  console.log('Request event:', {
    path: event.path,
    httpMethod: event.httpMethod,
    headers: event.headers,
    body: event.body
  });

  // Parse body if it's a string
  if (event.body && typeof event.body === 'string') {
    try {
      event.body = JSON.parse(event.body);
    } catch (e) {
      console.error('Error parsing request body:', e);
    }
  }

  // Create serverless handler
  const handler = serverless(app);
  
  try {
    const result = await handler(event, context) as any;
    
    // Log response for debugging
    console.log('Response:', {
      statusCode: result.statusCode,
      headers: result.headers,
      body: result.body
    });

    return {
      statusCode: result.statusCode || 200,
      body: typeof result.body === 'string' ? result.body : JSON.stringify(result.body || {}),
      headers: {
        'Access-Control-Allow-Origin': corsOptions.origin as string,
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Content-Type': 'application/json',
        ...(result.headers || {})
      }
    };
  } catch (error) {
    console.error('Handler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
      headers: {
        'Access-Control-Allow-Origin': corsOptions.origin as string,
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json'
      }
    };
  }
}; 