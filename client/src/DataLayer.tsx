import axios, { AxiosResponse } from "axios";
import Fuse from "fuse.js";
import _ from "lodash";
import { Container } from "unstated";

import { getNewId, Ingredient, PlannedMeal, Recipe, SavedDb } from "./models";

interface DataLayerState {
    ingredients: Ingredient[];
    recipes: Recipe[];
    plannedMeals: PlannedMeal[];

    newIngredients: Ingredient[];
}

const defaultIngredients: Ingredient[] = [
    { id: 1, name: "onion", plu: "234" },
    { id: 2, name: "apple", plu: "22" },
    { id: 3, name: "flour", plu: "445" },
    { id: 4, name: "banana", plu: "5567" },
];

export class DataLayer extends Container<DataLayerState> {
    constructor() {
        super();

        this.state = {
            ingredients: defaultIngredients,
            recipes: [],
            newIngredients: [],
            plannedMeals: [],
        };

        // after init-- fire off db query
        this.getDb();
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

    reloadFromServer(newDb: SavedDb) {
        console.log("new datA", newDb);

        // force all dates to be dates

        newDb.plannedMeals.forEach((meal) => {
            meal.date = new Date(meal.date);
        });

        this.setState({
            recipes: newDb.recipes,
            ingredients: newDb.ingredients,
            plannedMeals: newDb.plannedMeals,
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
        // 2. Set up the Fuse instance
        const fuse = new Fuse(this.state.recipes, {
            keys: ["name"],
        });

        // 3. Now search!
        return fuse.search(_query).map((c) => c.item);
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
}
