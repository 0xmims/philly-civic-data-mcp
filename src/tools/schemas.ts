import { z } from "zod";
import { DEFAULT_LIMIT, DEFAULT_NEARBY_LIMIT } from "../utils/limits.js";

const filterPrimitiveSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null()
]);

export const filterConditionSchema = z.union([
  filterPrimitiveSchema,
  z.array(filterPrimitiveSchema),
  z
    .object({
      eq: filterPrimitiveSchema.optional(),
      neq: filterPrimitiveSchema.optional(),
      gt: filterPrimitiveSchema.optional(),
      gte: filterPrimitiveSchema.optional(),
      lt: filterPrimitiveSchema.optional(),
      lte: filterPrimitiveSchema.optional(),
      in: z.array(filterPrimitiveSchema).optional(),
      like: z.string().optional()
    })
    .strict()
]);

export const filtersSchema = z.record(filterConditionSchema);

export const searchDatasetsSchema = z.object({
  keyword: z.string().default(""),
  category: z.string().optional(),
  limit: z.number().int().positive().default(10)
});

export const getDatasetSchemaShape = {
  dataset_id: z.string().optional(),
  source_url: z.string().url().optional()
};

export const getDatasetSchemaSchema = z
  .object(getDatasetSchemaShape)
  .refine((value) => value.dataset_id || value.source_url, {
    message: "Provide dataset_id or source_url."
  });

export const queryDatasetSchema = z.object({
  dataset_id: z.string(),
  filters: filtersSchema.default({}),
  fields: z.array(z.string()).optional(),
  limit: z.number().int().positive().default(DEFAULT_LIMIT),
  offset: z.number().int().min(0).default(0),
  order_by: z.string().optional()
});

export const queryNearbySchema = z.object({
  dataset_id: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius_meters: z.number().positive().default(500),
  limit: z.number().int().positive().default(DEFAULT_NEARBY_LIMIT),
  filters: filtersSchema.default({})
});

export const getBoundaryShape = {
  boundary_type: z.string(),
  name: z.string().optional(),
  id: z.union([z.string(), z.number()]).optional()
};

export const getBoundarySchema = z
  .object(getBoundaryShape)
  .refine((value) => value.name !== undefined || value.id !== undefined, {
    message: "Provide name or id."
  });

export const civicQuestionHelperSchema = z.object({
  question: z.string().min(3)
});

export type SearchDatasetsInput = z.infer<typeof searchDatasetsSchema>;
export type GetDatasetSchemaInput = z.infer<typeof getDatasetSchemaSchema>;
export type QueryDatasetInput = z.infer<typeof queryDatasetSchema>;
export type QueryNearbyInput = z.infer<typeof queryNearbySchema>;
export type GetBoundaryInput = z.infer<typeof getBoundarySchema>;
export type CivicQuestionHelperInput = z.infer<typeof civicQuestionHelperSchema>;
