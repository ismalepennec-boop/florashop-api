const { z } = require('zod');

const createProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().positive(),
  categoryId: z.string().uuid(),
  stock: z.number().int().min(0).default(0),
  isAvailable: z.boolean().default(true),
});

const updateProductSchema = createProductSchema.partial();

const createCategorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

module.exports = { createProductSchema, updateProductSchema, createCategorySchema };
