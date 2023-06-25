import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const NUTRITIONIX_API_URL =
  "https://trackapi.nutritionix.com/v2/natural/nutrients";
const USDA_API_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";

export const USDA_NUTRIENT_NUMBER_MAP: Record<string, string> = {
  208: "calories",
  203: "protein",
  204: "fat",
  205: "carbohydrate",
  291: "fiber",
  269: "sugar",
  299: "sugar_alchohol",
};
const USDA_DATA_TYPES = [
  "Branded",
  "Survey (FNDDS)",
  "SR Legacy",
  "Experimental",
  "Foundation",
] as const;
type USDA_DATA_TYPE = (typeof USDA_DATA_TYPES)[number];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  // const api_key = searchParams.get("api_key") || process.env.USDA_API_KEY;
  const app_id = process.env.NUTRITIONIX_APP_ID;
  const app_key = process.env.NUTRITIONIX_APP_KEY;
  if (!app_key || !app_id) throw new Error("Missing api_key or app_id");
  const query = searchParams.get("query");
  if (!query)
    return NextResponse.json({
      error: "Missing query",
    });
  const endpoint = searchParams.get("endpoint") || "nutritionix";
  if (endpoint === "usda") return getUsda(query);
  return getNutritionix(query);
}

async function getUsda(query: string) {
  const api_key = process.env.USDA_API_KEY;
  const pageNumber = "1";
  const pageSize = "5";
  const dataType = "";
  if (!api_key)
    return NextResponse.json({
      error: "Missing USDA api_key",
    });
  const params = {
    dataType,
    query,
    pageNumber,
    pageSize,
    api_key,
  };
  const fetchUrl = USDA_API_URL + "?" + new URLSearchParams(params);
  const res = await fetch(fetchUrl);
  const data = await res.json();
  return NextResponse.json(data);
}

async function getNutritionix(query: string) {
  const app_id = process.env.NUTRITIONIX_APP_ID;
  const app_key = process.env.NUTRITIONIX_APP_KEY;
  if (!app_key || !app_id)
    throw new Error("Missing Nutritionix api_key or app_id");
  const res = await fetch(NUTRITIONIX_API_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "x-app-id": app_id,
      "x-app-key": app_key,
      "x-remote-user-id": "0",
    },
    body: JSON.stringify({
      query,
    }),
  });
  const data = await res.json();
  return NextResponse.json(data);
}

const usdaNutrientSchema = z.object({
  nutrientId: z.number(),
  nutrientName: z.string(),
  nutrientNumber: z.string(),
  unitName: z.string(),
  value: z.number(),
});

const usdaFoodSchema = z
  .object({
    fdcId: z.number(),
    description: z.string(),
    dataType: z.string(),
    gtinUpc: z.string(),
    publishedDate: z.string(),
    brandOwner: z.string().optional(),
    brandName: z.string().optional(),
    ingredients: z.string(),
    foodCategory: z.string(),
    dataSource: z.string(),
    servingSizeUnit: z.string(),
    servingSize: z.number(),
    score: z.number(),
    foodNutrients: z.array(usdaNutrientSchema),
  })
  .partial();

export const usdaResponseSchema = z.object({
  totalHits: z.number(),
  totalPages: z.number(),
  pageList: z.array(z.number()),
  foods: z.array(usdaFoodSchema),
  aggregations: z.object({
    dataType: z
      .object({
        Branded: z.number(),
        "Survey (FNDDS)": z.number(),
        "SR Legacy": z.number(),
        Experimental: z.number(),
        Foundation: z.number(),
      })
      .partial(),
  }),
});
export type UsdaResponse = z.infer<typeof usdaResponseSchema>;
export type UsdaFood = z.infer<typeof usdaFoodSchema>;
export type UsdaNutrient = z.infer<typeof usdaNutrientSchema>;

export const nutrtionixSearchResultSchema = z.object({
  foods: z.array(
    z
      .object({
        food_name: z.string(),
        brand_name: z.string().nullable(),
        serving_qty: z.number(),
        serving_unit: z.string(),
        serving_weight_grams: z.number(),
        nf_calories: z.number(),
        nf_total_fat: z.number(),
        nf_saturated_fat: z.number(),
        nf_cholesterol: z.number(),
        nf_sodium: z.number(),
        nf_total_carbohydrate: z.number(),
        nf_dietary_fiber: z.number(),
        nf_sugars: z.number().nullable(),
        nf_protein: z.number(),
        nf_potassium: z.number(),
        nf_p: z.number(),
        source: z.number(),
        ndb_no: z.number(),
        alt_measures: z.array(
          z.union([
            z.object({
              serving_weight: z.number(),
              measure: z.string(),
              seq: z.number(),
              qty: z.number(),
            }),
            z.object({
              serving_weight: z.number(),
              measure: z.string(),
              seq: z.null(),
              qty: z.number(),
            }),
          ])
        ),
        photo: z.object({
          thumb: z.string().optional(),
          highres: z.string().optional().nullable(),
          is_user_uploaded: z.boolean(),
        }),
      })
      .deepPartial()
  ),
});

export type NutritionixSearchFoodResult = z.infer<
  typeof nutrtionixSearchResultSchema
>;
