import {
    Button,
    Card,
    FormGroup,
    InputGroup,
    Overlay,
} from "@blueprintjs/core";
import React from "react";

import { GLOBAL_DATA_LAYER } from "..";
import { handleStringChange } from "../helpers";
import { Recipe } from "../models";

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
            <Overlay
                onClose={() => {
                    this.handleOverlayClose();
                }}
                isOpen={this.props.isOpen}
            >
                <div
                    style={{
                        display: "flex",
                        height: "100vh",
                        width: "100vw",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                    onClick={() => this.handleOverlayClose()}
                >
                    <div onClick={(e) => e.stopPropagation()}>
                        <Card style={{ maxWidth: 400, maxHeight: 400 }}>
                            <p>search for a recipe</p>

                            <div>
                                <FormGroup>
                                    <InputGroup
                                        value={this.state.searchTerm}
                                        onChange={handleStringChange(
                                            (searchTerm) =>
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
                        </Card>
                    </div>
                </div>
            </Overlay>
        );
    }
}
