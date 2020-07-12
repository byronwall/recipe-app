import { Button, H3 } from "@blueprintjs/core"
import React from "react"
import { Subscribe } from "unstated"

import { DataLayer } from "../DataLayer"
import { NewRecipe } from "./NewRecipe"
import { Link } from "react-router-dom"

interface RecipeListProps {}
interface RecipeListState {
    showNewRecipeForm: boolean
}

export class RecipeList extends React.Component<
    RecipeListProps,
    RecipeListState
> {
    constructor(props: RecipeListProps) {
        super(props)

        this.state = { showNewRecipeForm: false }
    }

    componentDidMount() {}

    componentDidUpdate(
        prevProps: RecipeListProps,
        prevState: RecipeListState
    ) {}

    render() {
        return (
            <Subscribe to={[DataLayer]}>
                {(data: DataLayer) => (
                    <div>
                        <p>RecipeList</p>

                        <div>
                            <Button
                                text="add new recipe"
                                icon="plus"
                                intent="primary"
                                onClick={() =>
                                    this.setState({ showNewRecipeForm: true })
                                }
                            />

                            {this.state.showNewRecipeForm && <NewRecipe />}

                            <H3>recipe list</H3>

                            {data.state.recipes.map((recipe) => (
                                <Link to={"/recipe/" + recipe.id}>
                                    <div>{recipe.name}</div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </Subscribe>
        )
    }
}
