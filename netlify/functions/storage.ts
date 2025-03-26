import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { insertProductSchema, insertProductImageSchema } from './schema';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

type Product = z.infer<typeof insertProductSchema>;
type ProductImage = z.infer<typeof insertProductImageSchema>;

export const storage = {
  async createProduct(data: Product) {
    // Convert price to number for database storage
    const dbData = {
      ...data,
      price: parseFloat(data.price)
    };

    const { data: product, error } = await supabase
      .from('products')
      .insert([dbData])
      .select()
      .single();

    if (error) throw error;
    return product;
  },

  async createProductImage(data: ProductImage) {
    const { data: image, error } = await supabase
      .from('product_images')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return image;
  }
}; 