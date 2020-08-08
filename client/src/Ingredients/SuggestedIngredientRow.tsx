import { Button, EditableText } from "@blueprintjs/core";
import _ from "lodash";
import React from "react";
import { GLOBAL_DATA_LAYER } from "..";
import { Ingredient, IngredientAmount } from "../models";
import { NewIngAmt } from "../Recipes/ingredient_processing";
import { IngredientChooserOverlay } from "./IngredientChooserOverlay";
import { SuggestedIngredient } from "./SuggestedIngredients";

interface SuggestedIngredientRowProps {
    sugIngred: SuggestedIngredient;

    onSaveSuggestion(sugIngred: SuggestedIngredient): void;
}
interface SuggestedIngredientRowState {
    editSugIngred: SuggestedIngredient;

    isOverlayOpen: boolean;
}

export class SuggestedIngredientRow extends React.Component<
    SuggestedIngredientRowProps,
    SuggestedIngredientRowState
> {
    constructor(props: SuggestedIngredientRowProps) {
        super(props);

        this.state = { editSugIngred: props.sugIngred, isOverlayOpen: false };
    }

    componentDidMount() {}

    componentDidUpdate(
        prevProps: SuggestedIngredientRowProps,
        prevState: SuggestedIngredientRowState
    ) {
        const didPropsChange = !_.isEqual(
            this.props.sugIngred,
            prevProps.sugIngred
        );

        if (didPropsChange) {
            this.setState({ editSugIngred: _.cloneDeep(this.props.sugIngred) });
        }
    }

    handleSuggestionChange<K extends keyof IngredientAmount>(
        key: K,
        value: IngredientAmount[K]
    ) {
        this.setState((prevState) => {
            const newSugIngred = _.cloneDeep(prevState.editSugIngred);

            newSugIngred.suggestions.newIng[key] = value;
            return { editSugIngred: newSugIngred };
        });
    }

    handleNewIngAmtChange<K extends keyof NewIngAmt>(
        key: K,
        value: NewIngAmt[K]
    ) {
        this.setState((prevState) => {
            const newSugIngred = _.cloneDeep(prevState.editSugIngred);

            newSugIngred.suggestions[key] = value;

            return { editSugIngred: newSugIngred };
        });
    }

    render() {
        const c = this.state.editSugIngred;

        const ingred = c.originalIngredient;

        const newIng = c.suggestions;

        const editableName = (
            <div className="flex">
                <EditableText
                    value={newIng.newName}
                    onChange={(newName) =>
                        this.handleNewIngAmtChange("newName", newName)
                    }
                    multiline
                    maxLines={4}
                />
                <Button
                    icon="search"
                    minimal
                    onClick={() => this.setState({ isOverlayOpen: true })}
                />
                <IngredientChooserOverlay
                    isOpen={this.state.isOverlayOpen}
                    onClose={() => this.setState({ isOverlayOpen: false })}
                    onItemChosen={(newIngred) =>
                        this.updateIngredientFromOverlay(newIngred)
                    }
                />
            </div>
        );

        const didMatchExisting = newIng.newName === undefined;

        const color = didMatchExisting ? "#f2b195" : undefined;

        const sugName = (
            <div>
                {c.matchingIngred?.name}
                <Button
                    icon="cross"
                    minimal
                    onClick={() => this.hideSuggestedIngred()}
                />
            </div>
        );

        return (
            <tr>
                <td>
                    <div>
                        {ingred?.name}
                        <Button
                            minimal
                            icon="floppy-disk"
                            onClick={() => this.keepOriginal()}
                        />
                    </div>
                </td>
                <td style={{ backgroundColor: color }}>
                    {didMatchExisting ? sugName : editableName}
                </td>
                <td>
                    <EditableText
                        value={newIng.newIng.amount.toString()}
                        onChange={(amount) =>
                            this.handleSuggestionChange("amount", amount)
                        }
                        placeholder="amt"
                    />
                </td>
                <td>
                    <EditableText
                        value={newIng.newIng.unit}
                        onChange={(unit) =>
                            this.handleSuggestionChange("unit", unit)
                        }
                        placeholder="unit"
                    />
                </td>

                <td>
                    <EditableText
                        value={newIng.newIng.modifier}
                        onChange={(modifier) =>
                            this.handleSuggestionChange("modifier", modifier)
                        }
                        placeholder="mod"
                    />
                </td>
                <td>
                    <Button
                        text="keep"
                        onClick={() => this.saveSuggestion()}
                        minimal
                    />
                </td>
            </tr>
        );
    }
    updateIngredientFromOverlay(newIngred: Ingredient): void {
        console.log("chosen from chooser", newIngred);
        // update the edit ingredient
        const newSug = _.cloneDeep(this.state.editSugIngred);

        newSug.matchingIngred = newIngred;
        newSug.suggestions.newIng.ingredientId = newIngred.id;
        newSug.suggestions.newName = undefined;

        // close the overlay

        this.setState({ isOverlayOpen: false, editSugIngred: newSug });
    }
    private keepOriginal() {
        const newIngred = _.cloneDeep(this.props.sugIngred.originalIngredient);
        newIngred.isGoodName = true;
        GLOBAL_DATA_LAYER.updateIngredient(newIngred);
    }

    hideSuggestedIngred() {
        this.handleSuggestionChange(
            "ingredientId",
            this.props.sugIngred.originalIngredient.id
        );
        this.handleNewIngAmtChange(
            "newName",
            this.props.sugIngred.originalIngredient.name
        );
    }
    saveSuggestion() {
        this.props.onSaveSuggestion(this.state.editSugIngred);
    }
}
