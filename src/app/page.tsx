const recipes = [
  {
    name: "Chicken Ragu",
    ingredients: [],
    steps: [],
    servings: 10,
    macros: {
      protein: 540,
      carbs: 170,
      fat: 120,
    },
  },
  {
    name: "Chicken Chili",
    ingredients: [],
    steps: [],
    servings: 10,
    macros: {
      protein: 260,
      carbs: 230,
      fat: 80,
    },
  },
];

type Recipe = (typeof recipes)[0];

const MACRO_CALORIES_MAP = {
  protein: 4,
  carbs: 4,
  fat: 9,
};

export function calculateCalories({ protein, carbs, fat }: Recipe["macros"]) {
  if (isNaN(protein) || isNaN(carbs) || isNaN(fat)) return NaN;
  return (
    protein * MACRO_CALORIES_MAP.protein +
    carbs * MACRO_CALORIES_MAP.carbs +
    fat * MACRO_CALORIES_MAP.fat
  );
}

function calculateRecipeCalories(recipe: Recipe) {
  const { protein, carbs, fat } = recipe.macros;
  return calculateCalories({ protein, carbs, fat });
}

function calculateRecipeCaloriesPerServing(recipe: Recipe) {
  return calculateRecipeCalories(recipe) / recipe.servings;
}

function calculatePercentageOfCaloriesPerMacro(recipe: Recipe) {
  const calories = calculateRecipeCalories(recipe);
  const { protein, carbs, fat } = recipe.macros;
  return {
    protein: (protein * MACRO_CALORIES_MAP.protein) / calories,
    carbs: (carbs * MACRO_CALORIES_MAP.carbs) / calories,
    fat: (fat * MACRO_CALORIES_MAP.fat) / calories,
  };
}

function formatPercentage(percentage: number) {
  return `${Math.round(percentage * 100)}%`;
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const caloriesPerMacro = calculatePercentageOfCaloriesPerMacro(recipe);
  const pWidth = formatPercentage(caloriesPerMacro.protein);
  const cWidth = formatPercentage(caloriesPerMacro.carbs);
  const fWidth = formatPercentage(caloriesPerMacro.fat);
  const pGrams = `${Math.round(recipe.macros.protein / recipe.servings)}g`;
  const cGrams = `${Math.round(recipe.macros.carbs / recipe.servings)}g`;
  const fGrams = `${Math.round(recipe.macros.fat / recipe.servings)}g`;

  return (
    <div className="flex gap-8 rounded-sm border-2 border-stone-600 bg-stone-800 p-8 text-xl text-stone-50 shadow-sm">
      <div className="my-auto flex w-1/3 flex-col gap-4">
        <h1 className="text-5xl">{recipe.name}</h1>
        <div className="flex w-full select-none overflow-clip rounded-full bg-stone-500 text-stone-950">
          <div className="bg-data-green text-center" style={{ width: pWidth }}>
            {pWidth}
          </div>
          <div className="bg-data-purple text-center" style={{ width: cWidth }}>
            {cWidth}
          </div>
          <div className="bg-data-orange text-center" style={{ width: fWidth }}>
            {fWidth}
          </div>
        </div>
      </div>

      <div className="my-auto flex grow flex-col gap-4 text-3xl">
        <p>Calories: {calculateRecipeCaloriesPerServing(recipe)}</p>
        <p className="text-2xl">Servings: {recipe.servings}</p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="rounded-md bg-data-green p-2 text-stone-950">
          Protein: {pGrams}
        </div>
        <div className="rounded-md bg-data-purple p-2 text-stone-950">
          Carbs: {cGrams}
        </div>
        <div className="rounded-md bg-data-orange p-2 text-stone-950">
          Fat: {fGrams}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="m-auto max-w-[70rem]">
      <div className="flex flex-col gap-4">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.name} recipe={recipe} />
        ))}
      </div>
      <br />
    </main>
  );
}
