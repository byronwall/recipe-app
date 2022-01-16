import { EditableText, H3, H5 } from "@blueprintjs/core";
import React from "react";
import { GLOBAL_DATA_LAYER } from "..";
import { Ingredient, ShoppingListItem } from "../models";

interface AisleChooserProps {
    item: ShoppingListItem | undefined;
    onNewAisle(
        ing: Ingredient | undefined,
        newAisle: string,
        item: ShoppingListItem
    ): void;
}

export class AisleChooser extends React.Component<AisleChooserProps> {
    public render() {
        const { item, onNewAisle } = this.props;

        if (item === undefined) {
            return "item was not found?";
        }

        const ing = GLOBAL_DATA_LAYER.getIngredient(
            item.ingredientAmount.ingredientId
        );

        return (
            <div>
                <H3>edit aisle</H3>
                <H5>{item.textOnly ?? ing?.name}</H5>
                <p>
                    your edits will be saved when you hit enter or click off the
                    text box
                </p>
                <H5>
                    <EditableText
                        defaultValue={item.forcedAisle ?? ing?.aisle}
                        onConfirm={(newAisle) =>
                            onNewAisle(ing, newAisle, item)
                        }
                        selectAllOnFocus
                        isEditing={true}
                    />
                </H5>
            </div>
        );
    }
}
