import { EditableText, H3, H5 } from "@blueprintjs/core";
import React from "react";
import { GLOBAL_DATA_LAYER } from "..";
import { Ingredient, ShoppingListItem } from "../models";

interface AisleChooserProps {
    item: ShoppingListItem | undefined;
    onNewAisle(ing: Ingredient, newAisle: string): void;
}
interface AisleChooserState {}

export class AisleChooser extends React.Component<
    AisleChooserProps,
    AisleChooserState
> {
    constructor(props: AisleChooserProps) {
        super(props);

        this.state = {};
    }

    componentDidMount() {}

    componentDidUpdate(
        prevProps: AisleChooserProps,
        prevState: AisleChooserState
    ) {}

    render() {
        if (this.props.item === undefined) {
            return "item was not found?";
        }

        const ing = GLOBAL_DATA_LAYER.getIngredient(
            this.props.item.ingredientAmount.ingredientId
        );

        if (ing === undefined) {
            return "ingredient was not found?";
        }

        return (
            <div>
                <H3>edit aisle</H3>
                <H5>{ing.name}</H5>
                <p>
                    your edits will be saved when you hit enter or click off the
                    text box
                </p>
                <H5>
                    <EditableText
                        defaultValue={ing?.aisle}
                        onConfirm={(newAisle) =>
                            this.props.onNewAisle(ing, newAisle)
                        }
                        selectAllOnFocus
                        isEditing={true}
                    />
                </H5>
            </div>
        );
    }
}
