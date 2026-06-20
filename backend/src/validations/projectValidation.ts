import { z } from 'zod';

export const projectSchema = z.object({
  body: z.object({
    idea: z.string().min(5, 'Project idea must be at least 5 characters long'),
  }),
});