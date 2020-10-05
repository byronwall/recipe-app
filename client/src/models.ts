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
    name: "",
    description: "",
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

  userAccessToken: string;
  userRefreshToken: string;
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

export interface API_ShoppingRemoveRecipe {
  recipeId: number;
}

export interface API_KrogerSearch {
  filterTerm: string;
}

export interface API_KrogerAddCart {
  items: KrogerAddCartItem[];
}

export interface API_KrogerAddCartResponse {
  result: boolean;
}

export interface KrogerAddCartItem {
  upc: string;
  quantity: number;
}

export interface ShoppingListItem {
  id: number;
  ingredientAmount: IngredientAmount;
  recipeId: number; // will be -1 if "loose"
  isBought: boolean;

  /** Field used when there is not corresponding ingredient or recipe */
  textOnly?: string;
}

export interface API_ShoppingAdd {
  items: ShoppingListItem[];
}
export interface API_ShoppingDelete {
  ids: number[];
}

export interface API_ShoppingUpdate {
  item: ShoppingListItem[];
}

export interface API_MealPlanUpdate {
  meals: PlannedMeal[];
}

export interface API_KrogerAccessRes {
  expires_in: number;
  access_token: string;
  token_type: string;
}

export interface AisleLocation {
  bayNumber: string;
  description: string;
  number: string;
  numberOfFacings: string;
  sequenceNumber: string;
  side: string;
  shelfNumber: string;
  shelfPositionInBay: string;
}

export interface ItemInformation {
  depth: string;
  height: string;
  width: string;
}

export interface Temperature {
  indicator: string;
  heatSensitive: string;
}
export interface Size {
  size: string;
  url: string;
}

export interface Image {
  perspective: string;
  sizes: Size[];
  featured?: boolean;
}

export interface KrogerProduct {
  productId: string;
  upc: string;
  aisleLocations: any[];
  brand: string;
  categories: string[];
  description: string;
  images: Image[];
  items: Item[];
  itemInformation: ItemInformation;
  temperature: Temperature;
}
export interface Fulfillment {
  curbside: boolean;
  delivery: boolean;
  inStore: boolean;
  shipToHome: boolean;
}
export interface Price {
  regular: number;
  promo: number;
}

export interface Item {
  itemId: string;
  favorite: boolean;
  fulfillment: Fulfillment;
  price?: Price;
  size: string;
  soldBy: string;
}
export interface Pagination {
  total: string;
  start: string;
  limit: string;
}

export interface Meta {
  pagination: Pagination;
  warnings: string[];
}

export interface API_KrogerProdRes {
  data: KrogerProduct[];
  meta: Meta;
}

export interface KrogerAuthStatus {
  isAuthorized: boolean;
}

export interface KrogerAuthResponse {
  expires_in: number;
  access_token: string;
  token_type: string;
  refresh_token: string;
}
