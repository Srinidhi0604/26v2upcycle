import { z } from "zod";

export const insertProductSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string()
    .min(1, "Price is required")
    .transform((val) => {
      const price = parseFloat(val);
      if (isNaN(price)) throw new Error("Invalid price");
      if (price < 0) throw new Error("Price must be positive");
      // Validate INR amount (no decimals needed for rupees)
      const rupees = Math.round(price);
      if (rupees > Number.MAX_SAFE_INTEGER) throw new Error("Price is too large");
      return String(rupees); // Store as whole rupees
    }),
  category: z.string().min(1, "Category is required"),
  condition: z.string().min(1, "Condition is required"),
  location: z.string().min(1, "Location is required"),
  sellerId: z.string().min(1, "Seller ID is required"),
  status: z.enum(["active", "sold", "deleted"]).default("active"),
});

export const insertProductImageSchema = z.object({
  url: z.string().min(1, "Image URL is required"),
  productId: z.string(),
  isMain: z.boolean().default(false),
}); 