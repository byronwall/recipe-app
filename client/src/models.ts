export interface Recipe {
    name: string;
    description: string;
    id: number;

    ingredientGroups: IngredientGroup[];
    stepGroups: RecipeStepGroup[];
}

export interface IngredientGroup {
    title: string;
    ingredients: IngredientAmount[];
}

export interface RecipeStepGroup {
    title: string;
    steps: RecipeStep[];
}

export function createDefaultRecipe(): Recipe {
    return {
        name: "new recipe",
        description: "desc",
        id: getNewId(),
        ingredientGroups: [{ title: "group", ingredients: [] }],
        stepGroups: [{ title: "group", steps: [] }],
    };
}

let idExtra = 0;
export function getNewId() {
    return new Date().getTime() - idExtra++;
}

export interface RecipeStep {
    description: string;
    duration: string;
}

export interface IngredientAmount {
    ingredientId: number;
    amount: string | number;
    unit: string;
    modifier: string;
}

export interface Ingredient {
    name: string;

    comments: string; // meant to hold extra detail beyond the name

    plu: string;
    id: number;

    aisle: string;

    isGoodName: boolean;
}

export interface SavedDb {
    recipes: Recipe[];
    ingredients: Ingredient[];
    plannedMeals: PlannedMeal[];
    shoppingList: ShoppingListItem[];
}

export interface PlannedMeal {
    date: Date;
    recipeId: number;
    scale: number;

    isMade: boolean;
    isOnShoppingList: boolean;

    id: number;
}

export interface API_RecipeIngredParam {
    recipe: Recipe;
    ingredient: Ingredient;
}
export interface API_RecipeParam {
    recipe: Recipe;
}

export interface API_IngredParam {
    ingredient: Ingredient;
}

export interface ShoppingListItem {
    id: number;
    ingredientAmount: IngredientAmount;
    recipeId: number; // will be -1 if "loose"
    isBought: boolean;
}

export interface API_ShoppingAdd {
    items: ShoppingListItem[];
}
export interface API_ShoppingDelete {
    ids: number[];
}

export interface API_ShoppingUpdate {
    item: ShoppingListItem;
}
