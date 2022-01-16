import { Button, H2, HTMLTable, InputGroup } from "@blueprintjs/core";
import _ from "lodash";
import React from "react";

import { GLOBAL_DATA_LAYER } from "..";
import { handleStringChange } from "../helpers";
import { ActionsComp } from "../MealPlan/ActionsComp";
import { Ingredient, Recipe } from "../models";
import { OverlayCenter } from "../OverlayCenter";
import { NewRecipe } from "./NewRecipe";
import { RecipeListRow } from "./RecipeListRow";

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
    public constructor(props: RecipeListProps) {
        super(props);

        this.state = {
            showNewRecipeForm: false,
            oldRecipeText: "",
            searchTerm: "",
            recipesToShow: props.recipes,
        };
    }

    public componentDidUpdate(
        prevProps: RecipeListProps,
        prevState: RecipeListState
    ) {
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

    public render() {
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
                            onSaveRecipe={(newRecipe, newIngredients) =>
                                this.saveNewRecipe(newRecipe, newIngredients)
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
                                <RecipeListRow
                                    key={recipe.id}
                                    recipe={recipe}
                                />
                            ))}
                        </tbody>
                    </HTMLTable>
                </div>
            </div>
        );
    }

    private saveNewRecipe(newRecipe: Recipe, newIngredients: Ingredient[]) {
        GLOBAL_DATA_LAYER.saveNewRecipe(newRecipe, newIngredients);
    }
}
