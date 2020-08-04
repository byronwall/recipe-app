import React from "react";
import { Overlay, Card } from "@blueprintjs/core";
import { IngredientChooser } from "../Recipes/IngredientChooser";
import { Ingredient } from "../models";

interface IngredientChooserOverlayProps {
    isOpen: boolean;
    onClose(): void;

    onItemChosen(newIngred: Ingredient): void;
}
interface IngredientChooserOverlayState {}

export class IngredientChooserOverlay extends React.Component<
    IngredientChooserOverlayProps,
    IngredientChooserOverlayState
> {
    constructor(props: IngredientChooserOverlayProps) {
        super(props);

        this.state = {};
    }

    componentDidMount() {}

    componentDidUpdate(
        prevProps: IngredientChooserOverlayProps,
        prevState: IngredientChooserOverlayState
    ) {}

    render() {
        if (!this.props.isOpen) {
            return null;
        }

        return (
            <Overlay
                isOpen={this.props.isOpen}
                onClose={() => this.props.onClose()}
            >
                <div
                    className="grid-center"
                    onClick={() => this.props.onClose()}
                >
                    <Card
                        style={{ width: 300, height: 300 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <IngredientChooser
                            chosenItem={undefined}
                            onItemChange={(newItem) =>
                                this.props.onItemChosen(newItem)
                            }
                        />
                    </Card>
                </div>
            </Overlay>
        );
    }
}
