import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validate = (schema: z.ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          status: 'fail',
          message: 'Validation error',
   
          errors: error.issues.map((err: z.ZodIssue) => ({
            field: err.path.slice(1).join('.'), 
            message: err.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
};