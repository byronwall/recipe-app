import React from "react";
import { Recipe } from "../models";
import { H2, H3, H5, Button } from "@blueprintjs/core";
import { GLOBAL_DATA_LAYER } from "..";
import { NewRecipe } from "./NewRecipe";

interface RecipeViewerProps {
    recipe: Recipe | undefined;
}
interface RecipeViewerState {
    isEditMode: boolean;
}

export class RecipeViewer extends React.Component<
    RecipeViewerProps,
    RecipeViewerState
> {
    constructor(props: RecipeViewerProps) {
        super(props);

        this.state = { isEditMode: false };
    }

    componentDidMount() {}

    componentDidUpdate(
        prevProps: RecipeViewerProps,
        prevState: RecipeViewerState
    ) {}

    render() {
        const recipe = this.props.recipe;

        if (recipe === undefined) {
            return "bad id for recipe";
        }

        const recipeView = (
            <div>
                <H2>{recipe.name}</H2>

                <div>
                    <Button
                        text="edit me"
                        onClick={() => this.setState({ isEditMode: true })}
                    />
                </div>

                <H3>ingredients</H3>

                {recipe.ingredientGroups.map((inGrp, index) => (
                    <div key={index}>
                        <H5>{inGrp.title}</H5>

                        <ul>
                            {inGrp.ingredients.map((inAmt, index) => {
                                // need to search for ingredients
                                const ingred = GLOBAL_DATA_LAYER.getIngredient(
                                    inAmt.ingredientId
                                );

                                return <li key={index}>{ingred?.name}</li>;
                            })}
                        </ul>
                    </div>
                ))}

                <H3>steps</H3>

                {recipe.stepGroups.map((inGrp, index) => (
                    <div key={index}>
                        <H5>{inGrp.title}</H5>

                        <ol>
                            {inGrp.steps.map((step, index) => {
                                return <li key={index}>{step.description}</li>;
                            })}
                        </ol>
                    </div>
                ))}
            </div>
        );

        const recipeEdit = (
            <div>
                <Button
                    text="cancel edit"
                    onClick={() =>
                        this.setState({
                            isEditMode: false,
                        })
                    }
                />
                <NewRecipe
                    defaultRecipe={this.props.recipe}
                    onSaveRecipe={(newRecipe) => this.saveEdits(newRecipe)}
                />
            </div>
        );

        return this.state.isEditMode ? recipeEdit : recipeView;
    }
    saveEdits(newRecipe: Recipe): void {
        GLOBAL_DATA_LAYER.saveNewRecipe(newRecipe);

        this.setState({ isEditMode: false });
    }
}
