import { Button, Card, H4, HTMLTable, InputGroup } from "@blueprintjs/core";
import _ from "lodash";
import React from "react";

import { IngredientAmount, Recipe, Ingredient } from "../models";
import {
    guessIngredientParts,
    NewIngAmt,
} from "../Recipes/ingredient_processing";
import { GLOBAL_DATA_LAYER } from "..";
import { handleStringChange } from "../helpers";
import { SuggestedIngredientRow } from "./SuggestedIngredientRow";

type IngredientHash = {
    [key: number]: IngredientAmount | null;
};

interface SuggestedIngredientsProps {
    recipes: Recipe[];
    ingredients: Ingredient[];
}
interface SuggestedIngredientsState {
    ingredientHash: IngredientHash;
    suggestions: SuggestedIngredient[];
    searchText: string;
}

export interface SuggestedIngredient {
    originalIngredient: Ingredient;
    suggestions: NewIngAmt;
    matchingIngred: Ingredient | undefined;
}

export class SuggestedIngredients extends React.Component<
    SuggestedIngredientsProps,
    SuggestedIngredientsState
> {
    constructor(props: SuggestedIngredientsProps) {
        super(props);

        this.state = { ingredientHash: {}, suggestions: [], searchText: "" };
    }

    componentDidMount() {}

    componentDidUpdate(
        prevProps: SuggestedIngredientsProps,
        prevState: SuggestedIngredientsState
    ) {
        const didRecipesChange = !_.isEqual(
            this.props.recipes,
            prevProps.recipes
        );

        const didIngredientsChange = !_.isEqual(
            this.props.ingredients,
            prevProps.ingredients
        );

        const didSearchChange = this.state.searchText !== prevState.searchText;

        if (didRecipesChange || didIngredientsChange || didSearchChange) {
            this.updateSuggestions();
        }
    }

    private updateSuggestions() {
        const ingredientHash: IngredientHash = {};

        this.props.recipes.forEach((r) => {
            r.ingredientGroups.forEach((g) => {
                g.ingredients.forEach((i) => {
                    if (ingredientHash[i.ingredientId] === undefined) {
                        ingredientHash[i.ingredientId] = i;
                    } else {
                        ingredientHash[i.ingredientId] = null;
                    }
                });
            });
        });

        const suggestions = _.values(ingredientHash)
            .filter((c) => c !== null)

            .map((c) => c as IngredientAmount)
            .reduce<SuggestedIngredient[]>((acc, c) => {
                const ingred = this.props.ingredients.find(
                    (d) => d.id === c?.ingredientId
                );

                if (acc.length > 30 || ingred === undefined) {
                    return acc;
                }

                const doesMatchSearch =
                    this.state.searchText === "" ||
                    ingred?.name
                        .toUpperCase()
                        .indexOf(this.state.searchText.toUpperCase()) > -1;

                if (!doesMatchSearch) {
                    return acc;
                }

                const newIng = guessIngredientParts(c);
                if (newIng === undefined || ingred.isGoodName) {
                    return acc;
                }

                const newSugg: SuggestedIngredient = {
                    originalIngredient: ingred,
                    suggestions: newIng,
                    matchingIngred:
                        newIng.newName === undefined
                            ? this.props.ingredients.find(
                                  (c) => c.id === newIng.newIng.ingredientId
                              )
                            : undefined,
                };

                acc.push(newSugg);

                return acc;
            }, [])
            .filter((c) => c !== undefined)
            .map((c) => c as SuggestedIngredient);

        this.setState({ suggestions });
    }

    keepSuggestedIngredient(suggestion: SuggestedIngredient) {
        // find the ingredient -- change its name

        // find the ingredient amount (only 1), change the amount and units

        // save those two items -- ingredient amounts live in a recipe

        // know it's 1:1 -- just search all recipes for now

        const ingredId = suggestion.originalIngredient.id;

        const recipe = this.props.recipes.find((c) =>
            c.ingredientGroups.some(
                (grp) =>
                    grp.ingredients.findIndex(
                        (d) => d.ingredientId === ingredId
                    ) > -1
            )
        );

        if (recipe === undefined) {
            console.error("recipe not found?");
            return;
        }

        const newIngred = _.cloneDeep(suggestion.originalIngredient);
        newIngred.name = suggestion.suggestions.newName ?? "";
        newIngred.isGoodName = true;

        const newRecipe = _.cloneDeep(recipe);
        newRecipe.ingredientGroups.forEach((grp) => {
            grp.ingredients.forEach((ingAmt) => {
                if (ingAmt.ingredientId === ingredId) {
                    // need to update
                    ingAmt.amount = suggestion.suggestions.newIng.amount;
                    ingAmt.unit = suggestion.suggestions.newIng.unit;
                    ingAmt.ingredientId =
                        suggestion.suggestions.newIng.ingredientId;
                }
            });
        });

        console.log(suggestion, ingredId, recipe);

        if (suggestion.suggestions.newName === undefined) {
            GLOBAL_DATA_LAYER.updateRecipe(newRecipe);
        } else {
            GLOBAL_DATA_LAYER.updateRecipeAndIngredient(newRecipe, newIngred);
        }

        // TODO: allow generic edits on the item

        // TODO: get each row into its own object with state for edits

        // TODO: take the suggested item and save that to the DB - update the ingredient
    }

    render() {
        return (
            <Card>
                <H4>ingredients to check</H4>

                <p>
                    All of these are ingredients which are only used once and
                    which have not been tagged as "good"
                </p>

                <InputGroup
                    value={this.state.searchText}
                    onChange={handleStringChange((searchText) =>
                        this.setState({ searchText })
                    )}
                />

                <HTMLTable striped condensed bordered>
                    <thead>
                        <tr>
                            <th>original</th>
                            <th>new name</th>
                            <th>new amt</th>
                            <th>new unit</th>
                            <th>new modifier</th>
                            <th>actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.suggestions.map((c, index) => (
                            <SuggestedIngredientRow
                                key={index}
                                onSaveSuggestion={(sugInged) =>
                                    this.keepSuggestedIngredient(sugInged)
                                }
                                sugIngred={c}
                            />
                        ))}
                    </tbody>
                </HTMLTable>
            </Card>
        );
    }
}
