import { Button, H3, H4 } from "@blueprintjs/core";
import React from "react";
import { Subscribe } from "unstated";

import { DataLayer } from "../DataLayer";
import { NewRecipe } from "./NewRecipe";
import { Link } from "react-router-dom";

import old_recipes from "../recipes.json";

interface RecipeListProps {}
interface RecipeListState {
    showNewRecipeForm: boolean;

    oldRecipeText: string;
}

export class RecipeList extends React.Component<
    RecipeListProps,
    RecipeListState
> {
    constructor(props: RecipeListProps) {
        super(props);

        this.state = { showNewRecipeForm: false, oldRecipeText: "" };
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
                                <Link
                                    key={recipe.id}
                                    to={"/recipe/" + recipe.id}
                                >
                                    <div>{recipe.name}</div>
                                </Link>
                            ))}
                        </div>

                        <div>
                            <H4>old recipes</H4>
                            {old_recipes.recipes.map((old) => (
                                <div
                                    style={{ display: "flex" }}
                                    key={old.url.url}
                                >
                                    <p>{old.url.title}</p>
                                    <Button
                                        onClick={() =>
                                            this.setState({
                                                oldRecipeText: old.content,
                                            })
                                        }
                                        icon="zoom-in"
                                    />
                                </div>
                            ))}

                            <div
                                dangerouslySetInnerHTML={{
                                    __html: this.state.oldRecipeText,
                                }}
                            />
                        </div>
                    </div>
                )}
            </Subscribe>
        );
    }
}
