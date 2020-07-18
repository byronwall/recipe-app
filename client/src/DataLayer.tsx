import axios from "axios";
import _ from "lodash";
import { Container } from "unstated";

import { Ingredient, Recipe, SavedDb } from "./models";

interface DataLayerState {
    ingredients: Ingredient[];
    recipes: Recipe[];

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
        this.setState({
            recipes: newDb.recipes,
            ingredients: newDb.ingredients,
        });
    }

    async addIngredient(newIngredient: Ingredient) {
        const res = await axios.post("/api/add_ingredient", newIngredient);

        const newDb = res.data as SavedDb;

        console.log("new data", newDb);

        // this will fire off state updates
        this.reloadFromServer(newDb);
    }

    async saveNewRecipe(newRecipe: Recipe) {
        const res = await axios.post("/api/add_recipe", {
            recipe: newRecipe,
            newIngredients: this.state.newIngredients,
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

        const newDb = res.data as SavedDb;

        console.log("new data", newDb);

        // this will fire off state updates
        this.reloadFromServer(newDb);
    }

    async getDb() {
        const res = await axios.get("/api/db");

        const newDb = res.data as SavedDb;

        console.log("new data", newDb);

        // this will fire off state updates
        this.reloadFromServer(newDb);
    }
}
