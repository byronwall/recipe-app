import axios from "axios"
import _ from "lodash"
import { Container } from "unstated"

import { Ingredient, Recipe, SavedDb } from "./models"

interface DataLayerState {
    ingredients: Ingredient[]
    recipes: Recipe[]
}

const defaultIngredients: Ingredient[] = [
    { id: 1, name: "onion", plu: "234" },
    { id: 2, name: "apple", plu: "22" },
    { id: 3, name: "flour", plu: "445" },
    { id: 4, name: "banana", plu: "5567" },
]

export class DataLayer extends Container<DataLayerState> {
    constructor() {
        super()

        this.state = {
            ingredients: defaultIngredients,
            recipes: [],
        }

        // after init-- fire off db query
        this.getDb()
    }

    addNewRecipe(newRecipe: Recipe) {
        const newRecipes = _.cloneDeep(this.state.recipes)

        newRecipes.push(newRecipe)

        this.setState({ recipes: newRecipes })
    }

    reloadFromServer(newDb: SavedDb) {
        console.log("new datA", newDb)
        this.setState({
            recipes: newDb.recipes,
            ingredients: newDb.ingredients,
        })
    }

    async addIngredient(newIngredient: Ingredient) {
        const res = await axios.post("/api/add_ingredient", newIngredient)

        const newDb = res.data as SavedDb

        console.log("new data", newDb)

        // this will fire off state updates
        this.reloadFromServer(newDb)
    }

    async getDb() {
        const res = await axios.get("/api/db")

        const newDb = res.data as SavedDb

        console.log("new data", newDb)

        // this will fire off state updates
        this.reloadFromServer(newDb)
    }
}
