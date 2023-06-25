"use client";
import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import Image from "next/image";
import { Ingredient } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { FormLabeledInput } from "./FormInput";
import { calculateCalories } from "@/app/page";
import Combobox from "./Combobox";
import {
  NutritionixSearchFoodResult,
  USDA_NUTRIENT_NUMBER_MAP,
  UsdaResponse,
  nutrtionixSearchResultSchema,
  usdaResponseSchema,
} from "@/app/api/food/search/route";

type NtxDiscriminated = NutritionixSearchFoodResult & {
  endpoint: "nutritionix";
};
type UsdaDiscriminated = UsdaResponse & {
  endpoint: "usda";
};

async function getFoodSearch({
  query,
  pageNumber = 1,
  pageSize = 10,
  endpoint,
}: {
  query: string;
  pageNumber?: number;
  pageSize?: number;
  endpoint: "usda" | "nutritionix";
}): Promise<NtxDiscriminated | UsdaDiscriminated> {
  const params = {
    query,
    endpoint,
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  };
  const fetchUrl = "/api/food/search?" + new URLSearchParams(params);
  const res = await fetch(fetchUrl, {
    headers: {
      accept: "application/json",
    },
  });
  const data = await res.json();
  console.log("RECEIVED DATA", { endpoint, data });
  if (endpoint === "usda")
    return { endpoint: "usda", ...handleUsdaSearchResult(data) };
  return { endpoint: "nutritionix", ...handleNutritionixSearchResult(data) };
}

function handleUsdaSearchResult(data: any): UsdaResponse {
  // console.log("parsing", data);
  return usdaResponseSchema.parse(data);
}

function handleNutritionixSearchResult(data: any): NutritionixSearchFoodResult {
  if (data.message === "We couldn't match any of your foods")
    throw new Error("No results");
  const parsed = nutrtionixSearchResultSchema.parse(data);
  return parsed;
}

const ingredientFormSchema = z.object({
  name: z.string().min(3),
  brand_name: z.string().nullable(),
  description: z.string().nullable(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  calories: z.number(),
  serving_unit: z.object({
    value: z.string(),
    display: z.string(),
    id: z.number(),
  }),
  serving_qty: z.number(),
  serving_weight_grams: z.number(),
});
type IngredientForm = z.infer<typeof ingredientFormSchema>;
type NtxSearchResult = NutritionixSearchFoodResult["foods"][0];
function freedomizeUnit(unitInGrams: number) {
  if (!unitInGrams) return "";
  // grams to ounces rounded to 2 decimal places
  const oz = Math.round((unitInGrams / 28.34952) * 100) / 100;
  return `(${oz} oz.)`;
}
const servingUnitOptions = [
  { id: 1, value: "gram", display: "g" },
  { id: 2, value: "gram", display: "gram" },
  { id: 3, value: "tablespoon", display: "tbsp" },
  { id: 4, value: "tablespoon", display: "tablespoon" },
  { id: 5, value: "teaspoon", display: "tsp" },
  { id: 6, value: "teaspoon", display: "teaspoon" },
  { id: 7, value: "cup", display: "cup" },
  { id: 8, value: "cup", display: "cups" },
  { id: 9, value: "ounce", display: "oz" },
  { id: 10, value: "ounce", display: "ounce" },
  { id: 11, value: "pound", display: "lb" },
  { id: 12, value: "pound", display: "pound" },
  { id: 13, value: "milliliter", display: "ml" },
  { id: 14, value: "milliliter", display: "milliliter" },
  { id: 15, value: "liter", display: "l" },
  { id: 16, value: "liter", display: "liter" },
];
export default function SearchFood() {
  const [ntxSearchResult, setNtxSearchResult] = useState<NtxSearchResult>();
  const [usdaSearchResult, setUsdaSearchResult] =
    useState<UsdaResponse["foods"]>();
  const [searchQuery, setSearchQuery] = useState("");
  const {
    register: r,
    handleSubmit,
    watch,
    formState: { errors: e },
    setValue,
    control,
  } = useForm<IngredientForm>({
    resolver: zodResolver(ingredientFormSchema),
  });
  const form = watch();
  const attemptCompleteForm = useCallback(
    (apiResult: NtxSearchResult) => {
      setValue("name", apiResult.food_name || "");
      setValue("brand_name", apiResult.brand_name || "");
      setValue("protein", apiResult.nf_protein ?? NaN);
      setValue("carbs", apiResult.nf_total_carbohydrate ?? NaN);
      setValue("fat", apiResult.nf_total_fat ?? NaN);
      const calories = calculateCalories({
        protein: apiResult.nf_protein ?? NaN,
        carbs: apiResult.nf_total_carbohydrate ?? NaN,
        fat: apiResult.nf_total_fat ?? NaN,
      });
      setValue("calories", calories ?? NaN);

      const servingUnit = servingUnitOptions.find(
        (option) =>
          (option.display &&
            option.display?.toLowerCase() ===
              apiResult.serving_unit?.toLowerCase()) ||
          option.value.toLowerCase() === apiResult.serving_unit?.toLowerCase()
      );
      if (servingUnit) setValue("serving_unit", servingUnit);

      setValue("serving_qty", apiResult.serving_qty ?? NaN);
      setValue("serving_weight_grams", apiResult.serving_weight_grams ?? NaN);
    },
    [setValue]
  );
  const handleSearchClick = useCallback(() => {
    const fetchSearchResults = async (
      endpoint: "usda" | "nutritionix",
      query: string
    ) => {
      try {
        const results = await getFoodSearch({
          query,
          pageSize: 10,
          endpoint,
        });
        if (results.endpoint === "usda") {
          setUsdaSearchResult(results.foods);
        }
        if (results.endpoint === "nutritionix") {
          setNtxSearchResult(results.foods[0]);
          attemptCompleteForm(results.foods[0]);
        }
      } catch (e: any) {
        if (e.message === "No results") {
          alert("No results");
          setNtxSearchResult(undefined);
        } else {
          throw e;
        }
      }
    };
    fetchSearchResults("nutritionix", searchQuery);
    fetchSearchResults("usda", searchQuery);
  }, [searchQuery, attemptCompleteForm]);

  const onIngredientFormSubmit = handleSubmit((data) => {
    console.log(data);
  });

  useEffect(() => {
    const calories = calculateCalories({
      protein: form.protein,
      carbs: form.carbs,
      fat: form.fat,
    });
    if (calories !== form.calories) {
      setValue("calories", calories);
    }
  }, [form.protein, form.carbs, form.fat, form.calories, setValue]);

  return (
    <>
      <div className="mb-4">
        <h1 className="text-4xl">Ingredient Search</h1>
        <input
          type="text"
          name="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mr-4 mt-4 text-stone-950"
          placeholder="input"
        />
        <button name="search" type="submit" onClick={handleSearchClick}>
          search
        </button>
      </div>
      <br />
      <div className="flex w-full">
        {/* left */}
        <div className="w-full max-w-[70rem]">
          <h2>Nutritionix Results</h2>
          <br />
          <div className="">
            {ntxSearchResult && (
              <div
                key={ntxSearchResult.ndb_no}
                className="flex w-fit flex-col gap-2 divide-y border-2 border-stone-500 p-4"
              >
                <h2>{ntxSearchResult.food_name}</h2>
                <p>protein: {ntxSearchResult.nf_protein}</p>
                <p>carbs: {ntxSearchResult.nf_total_carbohydrate}</p>
                <p>fat: {ntxSearchResult.nf_total_fat}</p>
                <p>
                  serving: {ntxSearchResult.serving_qty}{" "}
                  {ntxSearchResult.serving_unit}
                </p>
                <p>
                  serving weight grams: {ntxSearchResult.serving_weight_grams}
                </p>
                <Image
                  height={200}
                  width={200}
                  src={ntxSearchResult.photo?.thumb ?? ""}
                  alt=""
                  className="object-contain"
                />
              </div>
            )}
            {!ntxSearchResult && (
              <div className="w-full text-center">No results</div>
            )}
          </div>
          <br />
          <br />
          <h2>USDA Results</h2>
          <br />
          <div className="flex gap-4 overflow-scroll">
            {usdaSearchResult?.length &&
              usdaSearchResult.map((result) => {
                const filteredNutrients = result.foodNutrients
                  ?.filter((nutrient) => {
                    return !!USDA_NUTRIENT_NUMBER_MAP[nutrient.nutrientNumber];
                  })
                  .map((nutrient) => ({
                    name: USDA_NUTRIENT_NUMBER_MAP[nutrient.nutrientNumber],
                    value: nutrient.value,
                    unit: nutrient.unitName,
                  }));
                return (
                  <div
                    key={result.fdcId}
                    className="flex w-fit flex-col gap-2 divide-y border-2 border-stone-500 p-4"
                  >
                    <h2>{result.description}</h2>
                    {filteredNutrients?.map((nutrient) => (
                      <div
                        key={nutrient.name}
                        className="w-full whitespace-nowrap"
                      >
                        {nutrient.name}: {nutrient.value} {nutrient.unit}
                      </div>
                    ))}
                    {/* <p>protein: {result.}</p>
                <p>carbs: {ntxSearchResult.nf_total_carbohydrate}</p>
                <p>fat: {ntxSearchResult.nf_total_fat}</p>
                <p>
                  serving: {ntxSearchResult.serving_qty}{" "}
                  {ntxSearchResult.serving_unit}
                </p>
                <p>
                  serving weight grams: {ntxSearchResult.serving_weight_grams}
                </p>
                <Image
                  height={200}
                  width={200}
                  src={ntxSearchResult.photo?.thumb ?? ""}
                  alt=""
                  className="object-contain"
                /> */}
                  </div>
                );
              })}
            {!usdaSearchResult?.length && (
              <div className="w-full text-center">No results</div>
            )}
          </div>
          <div></div>
        </div>
        {/* right */}
        <div className="ml-auto max-w-[30rem] grow">
          <h1 className="">Add Ingredient</h1>
          <br />
          <form
            className="flex flex-col gap-2"
            onSubmit={onIngredientFormSubmit}
          >
            <FormLabeledInput
              {...r("name")}
              error={!!e.name}
              label="Name"
              required={true}
            />
            <FormLabeledInput
              {...r("protein", {
                valueAsNumber: true,
              })}
              error={!!e.protein}
              label="Protein"
              required={true}
            />
            <FormLabeledInput
              {...r("carbs", {
                valueAsNumber: true,
              })}
              error={!!e.carbs}
              label="Carbs"
              required={true}
            />
            <FormLabeledInput
              {...r("fat", {
                valueAsNumber: true,
              })}
              error={!!e.fat}
              label="Fat"
              required={true}
            />
            <FormLabeledInput
              error={!!e.serving_unit}
              label="Serving Unit"
              required={true}
              inputElement={
                <Controller
                  control={control}
                  name={"serving_unit"}
                  render={({ field: { onChange, value, ref } }) => (
                    <Combobox
                      ref={ref}
                      initialValue={value}
                      onChange={onChange}
                      options={servingUnitOptions}
                      error={true}
                    />
                  )}
                />
              }
            />
            <FormLabeledInput
              {...r("serving_qty", {
                valueAsNumber: true,
              })}
              error={!!e.serving_qty}
              label="Serving Qty"
              required={true}
            />
            <FormLabeledInput
              {...r("serving_weight_grams", {
                valueAsNumber: true,
              })}
              error={!!e.serving_weight_grams}
              label="Serving Weight Grams"
              after={freedomizeUnit(form.serving_weight_grams)}
              required={true}
            />
            <FormLabeledInput
              {...r("calories", {
                valueAsNumber: true,
              })}
              error={!!e.calories}
              label="Calories"
              editable={false}
              after="calculated"
            />
            <FormLabeledInput
              {...r("brand_name")}
              error={!!e.brand_name}
              label="Brand Name"
            />
            <FormLabeledInput
              {...r("description")}
              error={!!e.description}
              label="Description"
            />

            <button type="submit">Add</button>
          </form>
        </div>
      </div>
    </>
  );
}
