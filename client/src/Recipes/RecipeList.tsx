import { Button, H2, HTMLTable, InputGroup } from "@blueprintjs/core";
import _ from "lodash";
import React from "react";
import { Link } from "react-router-dom";
import { GLOBAL_DATA_LAYER } from "..";
import { handleStringChange } from "../helpers";
import { ActionsComp } from "../MealPlan/MealPlan";
import { Recipe } from "../models";
import { OverlayCenter } from "../OverlayCenter";
import { NewRecipe } from "./NewRecipe";

interface RecipeListProps {
    recipes: Recipe[];
}
interface RecipeListState {
    showNewRecipeForm: boolean;

    oldRecipeText: string;

    searchTerm: string;
    recipesToShow: Recipe[];
}

export class RecipeList extends React.Component<
    RecipeListProps,
    RecipeListState
> {
    constructor(props: RecipeListProps) {
        super(props);

        this.state = {
            showNewRecipeForm: false,
            oldRecipeText: "",
            searchTerm: "",
            recipesToShow: props.recipes,
        };
    }

    componentDidMount() {}

    componentDidUpdate(prevProps: RecipeListProps, prevState: RecipeListState) {
        const didSearchChange = this.state.searchTerm !== prevState.searchTerm;
        const didRecipesChange = !_.isEqual(
            this.props.recipes,
            prevProps.recipes
        );

        if (didRecipesChange || didSearchChange) {
            // do the search and update visible recipes

            const recipesToShow = GLOBAL_DATA_LAYER.fuzzyMatchRecipe(
                this.state.searchTerm
            );
            this.setState({ recipesToShow });
        }
    }

    saveNewRecipe(newRecipe: Recipe) {
        GLOBAL_DATA_LAYER.saveNewRecipe(newRecipe);
    }

    removeRecipe(id: number) {
        const shouldDelete = window.confirm(
            "Are you sure you want to delete recipe?"
        );

        if (!shouldDelete) {
            return;
        }
        GLOBAL_DATA_LAYER.deleteRecipe(id);
    }

    render() {
        const recipesToShow = this.state.recipesToShow;
        return (
            <div>
                <div>
                    <ActionsComp>
                        <Button
                            text="add new recipe"
                            icon="plus"
                            intent="primary"
                            onClick={() =>
                                this.setState({ showNewRecipeForm: true })
                            }
                            minimal
                        />
                    </ActionsComp>

                    <OverlayCenter
                        isOpen={this.state.showNewRecipeForm}
                        onClose={() =>
                            this.setState({ showNewRecipeForm: false })
                        }
                        height={600}
                        width={800}
                    >
                        <NewRecipe
                            onSaveRecipe={(newRecipe) =>
                                this.saveNewRecipe(newRecipe)
                            }
                        />
                    </OverlayCenter>

                    <H2>recipe list</H2>

                    <InputGroup
                        placeholder="search..."
                        value={this.state.searchTerm}
                        onChange={handleStringChange((searchTerm) =>
                            this.setState({ searchTerm })
                        )}
                    />

                    <HTMLTable striped condensed bordered>
                        <thead>
                            <tr>
                                <th></th>
                                <th>name</th>
                                <th>actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {recipesToShow.map((recipe) => (
                                <tr key={recipe.id}>
                                    <td>{recipe.id}</td>
                                    <td>
                                        <Link to={"/recipe/" + recipe.id}>
                                            <div>{recipe.name}</div>
                                        </Link>
                                    </td>
                                    <td>
                                        <Button
                                            icon="cross"
                                            intent="danger"
                                            onClick={() =>
                                                this.removeRecipe(recipe.id)
                                            }
                                            minimal
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </HTMLTable>
                </div>
            </div>
        );
    }
}
