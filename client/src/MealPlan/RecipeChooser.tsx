import { Button, FormGroup, H5, InputGroup } from "@blueprintjs/core";
import React from "react";
import { GLOBAL_DATA_LAYER } from "..";
import { handleStringChange } from "../helpers";
import { Recipe } from "../models";
import { OverlayCenter } from "../OverlayCenter";

interface RecipeChooserProps {
    isOpen: boolean;

    onClose(): void;
    onSelect(recipe: Recipe): void;
}
interface RecipeChooserState {
    searchTerm: string;
}

export class RecipeChooser extends React.Component<
    RecipeChooserProps,
    RecipeChooserState
> {
    constructor(props: RecipeChooserProps) {
        super(props);

        this.state = { searchTerm: "" };
    }

    componentDidMount() {}

    componentDidUpdate(
        prevProps: RecipeChooserProps,
        prevState: RecipeChooserState
    ) {}

    handleOverlayClose() {
        this.setState({
            searchTerm: "",
        });
        this.props.onClose();
    }

    render() {
        // TODO: the event handling here is very hacky

        const possibleRecipes = GLOBAL_DATA_LAYER.fuzzyMatchRecipe(
            this.state.searchTerm
        );
        return (
            <OverlayCenter
                onClose={() => {
                    this.handleOverlayClose();
                }}
                isOpen={this.props.isOpen}
                height={400}
                width={400}
            >
                <H5>search for a recipe</H5>
                <div>
                    <FormGroup>
                        <InputGroup
                            value={this.state.searchTerm}
                            onChange={handleStringChange((searchTerm) =>
                                this.setState({
                                    searchTerm,
                                })
                            )}
                            autoFocus
                        />
                    </FormGroup>

                    <div>
                        {possibleRecipes.map((recipe) => (
                            <Button
                                key={recipe.id}
                                onClick={() => {
                                    this.setState({
                                        searchTerm: "",
                                    });
                                    this.props.onSelect(recipe);
                                }}
                                minimal
                            >
                                {recipe.name}
                            </Button>
                        ))}
                    </div>
                </div>
            </OverlayCenter>
        );
    }
}
