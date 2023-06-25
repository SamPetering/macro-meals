const API_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";
import SearchFood from "@/components/SearchFood";
import * as z from "zod";

const foodNutrientSchema = z.object({
  nutrientId: z.number(),
  nutrientName: z.string(),
  nutrientNumber: z.string(),
  unitName: z.string(),
  value: z.number(),
});
const searchResultFoodSchema = z
  .object({
    fdcId: z.number(),
    dataType: z.string(),
    description: z.string(),
    gtinUpc: z.string(),
    publishedDate: z.string(),
    brandOwner: z.string(),
    brandName: z.string(),
    ingredients: z.string(),
    marketCountry: z.string(),
    foodCategory: z.string(),
    packageWeight: z.string(),
    servingSizeUnit: z.string(),
    servingSize: z.number(),
    score: z.number(),
    foodNutrients: z.array(foodNutrientSchema),
  })
  .partial();

const searchResultSchema = z.object({
  totalHits: z.number(),
  currentPage: z.number(),
  totalPages: z.number(),
  foods: z.array(searchResultFoodSchema),
});

async function getFoodSearch({
  query,
  pageNumber = 1,
  pageSize = 10,
}: {
  query: string;
  pageNumber?: number;
  pageSize?: number;
}) {
  const api_key = process.env.USDA_API_KEY;
  if (!api_key) throw new Error("Missing USDA_API_KEY");

  const params = {
    query,
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
    api_key,
  };
  const fetchUrl = API_URL + "?" + new URLSearchParams(params);
  const res = await fetch(fetchUrl, {
    headers: {
      accept: "application/json",
    },
  });
  const data = await res.json();
  const parsed = searchResultSchema.parse(data);
  return parsed.foods;
}

export default async function Search() {
  const results = await getFoodSearch({
    query: "boneless skinless chicken breast",
    pageSize: 10,
  });
  return (
    <div className="m-auto w-[100rem] text-stone-50">
      <SearchFood />
    </div>
  );
}
