export interface Recipe {
    name: string
    description: string
    id: number

    ingredients: IngredientAmount[]
    steps: RecipeStep[]
}

export function createDefaultRecipe(): Recipe {
    return {
        name: "new recipe",
        description: "desc",
        id: getNewId(),
        ingredients: [],
        steps: [],
    }
}

export function getNewId() {
    return new Date().getTime()
}

export interface RecipeStep {
    description: string
    duration: string

    subSteps: RecipeStep[] | undefined
}

export interface IngredientAmount {
    ingredientId: number
    amount: string | number
    unit: string
    modifier: string
}

export interface Ingredient {
    name: string
    plu: string
    id: number
}

export interface SavedDb {
    recipes: Recipe[]
    ingredients: Ingredient[]
}
