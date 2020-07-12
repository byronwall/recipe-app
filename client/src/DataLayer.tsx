import _ from "lodash"
import { Container } from "unstated"

import { Ingredient, Recipe } from "./models"

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
    pendingReadItems: number[] = []

    constructor() {
        super()

        this.state = {
            ingredients: defaultIngredients,
            recipes: [],
        }
    }

    addNewRecipe(newRecipe: Recipe) {
        const newRecipes = _.cloneDeep(this.state.recipes)

        newRecipes.push(newRecipe)

        this.setState({ recipes: newRecipes })
    }
}
