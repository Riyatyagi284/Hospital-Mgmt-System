import type { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';

export function validateRequest(
  schema: any,
  source: 'body' | 'query' | 'params' = 'body',
  isPartial: boolean = false
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[source];

      if (isPartial) {
        // PATCH request support
        const partialSchema = schema.fork(Object.keys(schema.describe().keys), (field: any) =>
          field.optional()
        );

        req[source] = await partialSchema.validateAsync(data, {
          abortEarly: false,
          stripUnknown: true,
        });
      } else {
        req[source] = await schema.validateAsync(data, {
          abortEarly: false,
          stripUnknown: true,
        });
      }

      next();
    } catch (error: any) {
      next(
        createHttpError(
          400,
          error.details ? error.details.map((err: any) => err.message).join(', ') : error.message
        )
      );
    }
  };
}
