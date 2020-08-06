import { Button, EditableText, Icon } from "@blueprintjs/core";
import _ from "lodash";
import React from "react";

import { Ingredient, Recipe } from "../models";
import { Link } from "react-router-dom";

interface IngredientViewEditProps {
    ingredient: Ingredient;

    recipes: Recipe[];

    onSaveChanges(newIngredient: Ingredient): void;
}
interface IngredientViewEditState {
    editIngredient: Ingredient;
    matchingRecipe: Recipe[];
}

export class IngredientViewEdit extends React.Component<
    IngredientViewEditProps,
    IngredientViewEditState
> {
    constructor(props: IngredientViewEditProps) {
        super(props);

        this.state = { editIngredient: props.ingredient, matchingRecipe: [] };
    }

    get isDirty() {
        return !_.isEqual(this.props.ingredient, this.state.editIngredient);
    }

    componentDidMount() {
        this.updateMatchingRecipes();
    }

    componentDidUpdate(
        prevProps: IngredientViewEditProps,
        prevState: IngredientViewEditState
    ) {
        const didPropsChange = !_.isEqual(
            this.props.ingredient,
            prevProps.ingredient
        );

        if (didPropsChange) {
            this.updateMatchingRecipes();
            this.setState({
                editIngredient: _.cloneDeep(this.props.ingredient),
            });
        }
    }

    updateMatchingRecipes() {
        let matches: Recipe[] = [];
        this.props.recipes.forEach((rec) =>
            rec.ingredientGroups.forEach((grp) =>
                grp.ingredients.forEach((ing) => {
                    if (ing.ingredientId === this.props.ingredient.id) {
                        matches.push(rec);
                    }
                })
            )
        );

        matches = _.uniqBy(matches, (c) => c.id);

        this.setState({ matchingRecipe: matches });
    }

    handleIngredientEdit<K extends keyof Ingredient>(
        key: K,
        value: Ingredient[K]
    ) {
        const newEditIngredient = _.cloneDeep(this.state.editIngredient);

        newEditIngredient[key] = value;

        this.setState({ editIngredient: newEditIngredient });
    }

    saveChanges(): void {
        console.log("save changes", this.state.editIngredient);
        this.props.onSaveChanges(this.state.editIngredient);
    }

    render() {
        return (
            <tr>
                <td>
                    {this.state.editIngredient.isGoodName && (
                        <Icon icon="star" intent="warning" />
                    )}
                </td>
                <td>
                    <EditableText
                        value={this.state.editIngredient.name}
                        onChange={(name) =>
                            this.handleIngredientEdit("name", name)
                        }
                        multiline
                        maxLines={2}
                    />
                </td>
                <td>
                    <EditableText
                        value={this.state.editIngredient.comments}
                        onChange={(comments) =>
                            this.handleIngredientEdit("comments", comments)
                        }
                        placeholder="comments"
                        multiline
                        maxLines={2}
                    />
                </td>
                <td>
                    <EditableText
                        value={this.state.editIngredient.plu ?? ""}
                        onChange={(plu) =>
                            this.handleIngredientEdit("plu", plu)
                        }
                        placeholder="plu"
                    />
                </td>
                <td>
                    <EditableText
                        value={this.state.editIngredient.aisle ?? ""}
                        onChange={(aisle) =>
                            this.handleIngredientEdit("aisle", aisle)
                        }
                        placeholder="aisle"
                    />
                </td>
                <td>
                    {this.state.matchingRecipe.slice(0, 3).map((rec) => (
                        <p key={rec.id}>
                            <Link to={"/recipe/" + rec.id}>{rec.name}</Link>
                        </p>
                    ))}
                </td>
                <td>
                    {this.isDirty && (
                        <Button
                            icon="floppy-disk"
                            minimal
                            onClick={() => this.saveChanges()}
                        />
                    )}
                </td>
            </tr>
        );
    }
}
