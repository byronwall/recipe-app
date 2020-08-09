import axios, { AxiosResponse } from "axios";
import Fuse from "fuse.js";
import FuzzySet from "fuzzyset";
import _ from "lodash";
import { Container } from "unstated";
import {
    API_IngredParam,
    API_MealPlanUpdate,
    API_RecipeIngredParam,
    API_RecipeParam,
    API_ShoppingAdd,
    API_ShoppingDelete,
    API_ShoppingUpdate,
    getNewId,
    Ingredient,
    PlannedMeal,
    Recipe,
    SavedDb,
    ShoppingListItem,
} from "./models";

interface DataLayerState {
    ingredients: Ingredient[];
    recipes: Recipe[];
    plannedMeals: PlannedMeal[];

    shoppingList: ShoppingListItem[];

    newIngredients: Ingredient[];

    fuzzyIngredientNames: FuzzySet;
    fuzzyIngredientMods: FuzzySet;
    fuzzyIngredientUnits: FuzzySet;
}

export class DataLayer extends Container<DataLayerState> {
    constructor() {
        super();

        this.state = {
            ingredients: [],
            recipes: [],
            newIngredients: [],
            plannedMeals: [],
            shoppingList: [],
            fuzzyIngredientNames: FuzzySet(),
            fuzzyIngredientMods: FuzzySet(),
            fuzzyIngredientUnits: FuzzySet(),
        };

        // after init-- fire off db query
        this.getDb();
    }

    async updateRecipeAndIngredient(newRecipe: Recipe, newIngred: Ingredient) {
        const postData: API_RecipeIngredParam = {
            recipe: newRecipe,
            ingredient: newIngred,
        };

        const res = await axios.post("/api/update_recipe_ingredient", postData);

        this.handleResponse(res);
    }

    async updateRecipe(newRecipe: Recipe) {
        const postData: API_RecipeParam = {
            recipe: newRecipe,
        };

        const res = await axios.post("/api/update_recipe", postData);

        this.handleResponse(res);
    }

    async updateIngredient(newIngredient: Ingredient) {
        const postData: API_IngredParam = {
            ingredient: newIngredient,
        };

        const res = await axios.post("/api/update_ingredient", postData);

        this.handleResponse(res);
    }

    addNewIngredient(newIngredient: Ingredient) {
        const isExisting =
            this.state.ingredients.find((c) => c.id === newIngredient.id) ??
            this.state.newIngredients.find((c) => c.id === newIngredient.id);

        console.log("add new ingred", newIngredient, isExisting);

        // don't need to add if existing
        if (isExisting) {
            return;
        }

        this.setState((prevState) => {
            return {
                newIngredients: prevState.newIngredients.concat(newIngredient),
            };
        });
    }

    getIngredient(id: number): Ingredient | undefined {
        // search known ingredients... then new ones

        return (
            this.state.ingredients.find((c) => c.id === id) ??
            this.state.newIngredients.find((c) => c.id === id)
        );
    }

    getRecipe(id: number): Recipe | undefined {
        // search known ingredients... then new ones

        return this.state.recipes.find((c) => c.id === id);
    }

    async addItemsToShoppingList(newItems: ShoppingListItem[]) {
        console.log("add new items", newItems);
        const postData: API_ShoppingAdd = {
            items: newItems,
        };

        const res = await axios.post("/api/add_shopping", postData);

        this.handleResponse(res);
    }

    async deleteShoppingListItems(ids: number[]) {
        const postData: API_ShoppingDelete = {
            ids,
        };

        const res = await axios.post("/api/delete_shopping", postData);

        this.handleResponse(res);
    }

    async updateShoppingListItem(newItem: ShoppingListItem[]) {
        const postData: API_ShoppingUpdate = {
            item: newItem,
        };

        const res = await axios.post("/api/update_shopping", postData);

        this.handleResponse(res);
    }

    reloadFromServer(newDb: SavedDb) {
        console.log("new datA", newDb);

        // force all dates to be dates

        newDb.plannedMeals.forEach((meal) => {
            meal.date = new Date(meal.date);
        });

        // add the ID which is parsed later
        // add the comments to help ID longer names
        const goodNames = newDb.ingredients
            .filter((c) => c.isGoodName)
            .map((c) => c.name + "|||" + c.id + "|||" + c.comments);

        const ingredFuzzy = FuzzySet(goodNames, false, 3, 9);

        let goodUnits: string[] = [];
        let goodMods: string[] = [];
        newDb.recipes.forEach((rec) =>
            rec.ingredientGroups.forEach((grp) =>
                grp.ingredients.forEach((ing) => {
                    goodMods.push(ing.modifier);
                    goodUnits.push(ing.unit);
                })
            )
        );
        goodMods = _.uniq(goodMods);
        goodUnits = _.uniq(goodUnits);

        console.log("modifiers", goodMods);

        const modFuzzy = FuzzySet(goodMods, false, 3, 9);
        const unitsFuzzy = FuzzySet(goodUnits, false, 3, 9);

        this.setState({
            recipes: newDb.recipes,
            ingredients: _.sortBy(newDb.ingredients, (c) => c.isGoodName),
            plannedMeals: newDb.plannedMeals,
            shoppingList: newDb.shoppingList,
            fuzzyIngredientNames: ingredFuzzy,
            fuzzyIngredientMods: modFuzzy,
            fuzzyIngredientUnits: unitsFuzzy,
        });
    }

    async addIngredient(newIngredient: Ingredient) {
        const res = await axios.post("/api/add_ingredient", newIngredient);

        this.handleResponse(res);
    }

    async saveNewRecipe(newRecipe: Recipe, newIngredients?: Ingredient[]) {
        console.log("save new", this.state.newIngredients);
        const res = await axios.post("/api/add_recipe", {
            recipe: newRecipe,
            newIngredients: newIngredients ?? this.state.newIngredients,
        });

        // remove any new ingredients client side since they'll be saved on server
        const usedIngredientIds = _.flatten(
            newRecipe.ingredientGroups.map((grp) =>
                grp.ingredients.map((d) => d.ingredientId)
            )
        );

        const filterNewIngred = this.state.newIngredients.filter(
            (i) => usedIngredientIds.find((c) => c === i.id) === undefined
        );

        this.setState({ newIngredients: filterNewIngred });

        this.handleResponse(res);
    }

    async getDb() {
        const res = await axios.get<SavedDb>("/api/db");

        this.handleResponse(res);
    }

    private handleResponse(res: AxiosResponse<SavedDb>) {
        const newDb = res.data;

        console.log("new data", newDb);

        // this will fire off state updates
        this.reloadFromServer(newDb);
    }

    fuzzyMatchRecipe(_query: string): Recipe[] {
        if (_query === "") {
            return this.state.recipes;
        }

        // 2. Set up the Fuse instance
        const fuse = new Fuse(this.state.recipes, {
            keys: ["name"],
        });

        // 3. Now search!
        return fuse.search(_query).map((c) => c.item);
    }

    async updateMealPlan(mealsToUpdate: PlannedMeal[]) {
        const postData: API_MealPlanUpdate = {
            meals: mealsToUpdate,
        };
        const res = await axios.post("/api/update_meals", postData);

        this.handleResponse(res);
    }

    async addMealPlanItem(date: Date | undefined, recipe: Recipe) {
        if (date === undefined) {
            return;
        }

        const meal: PlannedMeal = {
            date: date,
            recipeId: recipe.id,
            isMade: false,
            isOnShoppingList: false,
            scale: 1,
            id: getNewId(),
        };

        const res = await axios.post("/api/add_meal", {
            meal,
        });

        this.handleResponse(res);
    }

    async deletePlannedMeal(meal: PlannedMeal) {
        const res = await axios.post("/api/delete_meal", {
            meal,
        });

        this.handleResponse(res);
    }

    async deleteRecipe(id: number) {
        const res = await axios.post("/api/delete_recipe", {
            id,
        });

        this.handleResponse(res);
    }
}
