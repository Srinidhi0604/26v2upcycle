import { Handler } from '@netlify/functions';
import { storage } from './storage';
import { insertProductImageSchema } from './schema';
import { z } from 'zod';

export const handler: Handler = async (event) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    if (!event.body) {
      throw new Error('No request body');
    }

    const data = JSON.parse(event.body);
    const imageData = insertProductImageSchema.parse(data);

    const image = await storage.createProductImage(imageData);

    return {
      statusCode: 201,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        image,
        message: 'Image added successfully' 
      })
    };

  } catch (error) {
    console.error('Error creating product image:', error);
    
    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: 'Invalid data', 
          errors: error.errors 
        })
      };
    }

    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        message: 'Failed to add image' 
      })
    };
  }
}; 