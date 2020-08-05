import { Button, Checkbox, H2, H3, H5 } from "@blueprintjs/core";
import _ from "lodash";
import React from "react";
import SplitPane from "react-split-pane";

import { GLOBAL_DATA_LAYER } from "..";
import { handleBooleanChange } from "../helpers";
import { Recipe } from "../models";
import { NewRecipe } from "./NewRecipe";

interface RecipeViewerProps {
    recipe: Recipe | undefined;
}

type StringHash = { [key: string]: boolean };

interface RecipeViewerState {
    isEditMode: boolean;

    isCookingMode: boolean;

    stepsComplete: StringHash;
    ingredientsComplete: StringHash;
}

export class RecipeViewer extends React.Component<
    RecipeViewerProps,
    RecipeViewerState
> {
    constructor(props: RecipeViewerProps) {
        super(props);

        this.state = {
            isEditMode: false,
            isCookingMode: false,
            ingredientsComplete: {},
            stepsComplete: {},
        };
    }

    componentDidMount() {}

    componentDidUpdate(
        prevProps: RecipeViewerProps,
        prevState: RecipeViewerState
    ) {}

    handleIngredientCheck(
        grpIndex: number,
        itemIndex: number,
        newValue: boolean
    ) {
        const items = _.cloneDeep(this.state.ingredientsComplete);

        const key = grpIndex + "-" + itemIndex;
        items[key] = newValue;

        this.setState({ ingredientsComplete: items });
    }

    getIngredientCheck(grpIndex: number, itemIndex: number) {
        const items = this.state.ingredientsComplete;

        const key = grpIndex + "-" + itemIndex;
        return items[key] ?? false;
    }

    handleStepCheck(grpIndex: number, itemIndex: number, newValue: boolean) {
        const items = _.cloneDeep(this.state.stepsComplete);

        const key = grpIndex + "-" + itemIndex;
        items[key] = newValue;

        this.setState({ stepsComplete: items });
    }

    getStepCheck(grpIndex: number, itemIndex: number) {
        const items = this.state.stepsComplete;

        const key = grpIndex + "-" + itemIndex;
        return items[key] ?? false;
    }

    render() {
        const recipe = this.props.recipe;

        if (recipe === undefined) {
            return "bad id for recipe";
        }

        const ingredientDiv = (
            <div>
                <H3>ingredients</H3>

                {recipe.ingredientGroups.map((inGrp, index) => (
                    <div key={index}>
                        <H5>{inGrp.title}</H5>

                        <ul>
                            {inGrp.ingredients.map((inAmt, idx) => {
                                // need to search for ingredients
                                const ingredient = GLOBAL_DATA_LAYER.getIngredient(
                                    inAmt.ingredientId
                                );

                                const isComplete = this.getIngredientCheck(
                                    index,
                                    idx
                                );
                                return (
                                    <li key={idx}>
                                        {this.state.isCookingMode ? (
                                            <Checkbox
                                                label={ingredient?.name}
                                                checked={isComplete}
                                                onChange={handleBooleanChange(
                                                    (newValue) =>
                                                        this.handleIngredientCheck(
                                                            index,
                                                            idx,
                                                            newValue
                                                        )
                                                )}
                                                style={{
                                                    color: isComplete
                                                        ? "#ccc"
                                                        : undefined,
                                                }}
                                            />
                                        ) : (
                                            `${inAmt.amount} (${inAmt.unit}) ${ingredient?.name}, ${inAmt.modifier}`
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>
        );

        const recipeContents = (
            <div>
                <H3>steps</H3>

                {recipe.stepGroups.map((inGrp, index) => (
                    <div key={index}>
                        <H5>{inGrp.title}</H5>

                        <ol>
                            {inGrp.steps.map((step, idx) => {
                                const isComplete = this.getStepCheck(
                                    index,
                                    idx
                                );
                                return (
                                    <li key={idx}>
                                        {this.state.isCookingMode ? (
                                            <Checkbox
                                                label={step.description}
                                                checked={isComplete}
                                                onChange={handleBooleanChange(
                                                    (newValue) =>
                                                        this.handleStepCheck(
                                                            index,
                                                            idx,
                                                            newValue
                                                        )
                                                )}
                                                style={{
                                                    color: isComplete
                                                        ? "#ccc"
                                                        : undefined,
                                                }}
                                            />
                                        ) : (
                                            step.description
                                        )}
                                    </li>
                                );
                            })}
                        </ol>
                    </div>
                ))}
            </div>
        );

        const recipeView = (
            <div>
                <H2>{recipe.name}</H2>

                <div>
                    <Button
                        text="edit me"
                        onClick={() => this.setState({ isEditMode: true })}
                    />

                    <Button
                        text="cooking mode"
                        onClick={() => this.setState({ isCookingMode: true })}
                    />
                </div>

                {this.state.isCookingMode ? (
                    <div
                        style={{
                            position: "absolute",
                            height: "100vh",
                            width: "100vw",
                            top: 0,
                            left: 0,
                            zIndex: 100,
                            backgroundColor: "#fff",
                        }}
                    >
                        <SplitPane
                            split="horizontal"
                            defaultSize={300}
                            paneStyle={{ overflow: "auto" }}
                        >
                            {ingredientDiv}
                            {recipeContents}
                        </SplitPane>

                        <div
                            style={{ position: "absolute", top: 10, right: 10 }}
                        >
                            <Button
                                minimal
                                icon="cross"
                                intent="danger"
                                onClick={() =>
                                    this.setState({ isCookingMode: false })
                                }
                            />
                        </div>
                    </div>
                ) : (
                    <div>
                        {ingredientDiv}
                        {recipeContents}
                    </div>
                )}
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
