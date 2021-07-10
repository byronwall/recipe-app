import { Button, Checkbox, H2, H3, H5 } from "@blueprintjs/core";
import _ from "lodash";
import NoSleep from "nosleep.js";
import React from "react";
import SplitPane from "react-split-pane";
import { globalLog, GLOBAL_DATA_LAYER } from "..";
import { handleBooleanChange } from "../helpers";
import { ActionsComp } from "../MealPlan/ActionsComp";
import { Ingredient, IngredientAmount, Recipe } from "../models";
import { EditRecipe } from "./EditRecipe";

interface RecipeViewerProps {
    recipe: Recipe | undefined;
}

type StringHash = { [key: string]: boolean };

interface RecipeViewerState {
    isEditMode: boolean;

    isCookingMode: boolean;
    isScreenLockedOn: boolean;

    stepsComplete: StringHash;
    ingredientsComplete: StringHash;
}

export class RecipeViewer extends React.Component<
    RecipeViewerProps,
    RecipeViewerState
> {
    noSleep = new NoSleep();

    constructor(props: RecipeViewerProps) {
        super(props);

        this.state = {
            isEditMode: false,
            isCookingMode: false,
            ingredientsComplete: {},
            stepsComplete: {},
            isScreenLockedOn: false,
        };
    }

    componentDidMount() {}

    componentWillUnmount() {
        this.noSleep.disable();
    }

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

    toggleLockedScreen() {
        this.setState((prevState) => {
            const newLock = !prevState.isScreenLockedOn;

            if (newLock) {
                this.noSleep.enable();
            } else {
                this.noSleep.disable();
            }
            return { isScreenLockedOn: newLock };
        });
    }
    saveEdits(newRecipe: Recipe): void {
        globalLog("new recipe", newRecipe);
        GLOBAL_DATA_LAYER.saveNewRecipe(newRecipe);

        this.setState({ isEditMode: false });
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
                                const ingredientText = ingredientToString(
                                    inAmt,
                                    ingredient
                                );
                                return (
                                    <li key={idx}>
                                        {this.state.isCookingMode ? (
                                            <Checkbox
                                                label={ingredientText}
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
                                            ingredientText
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
                <ActionsComp>
                    <Button
                        text="add to shopping list"
                        minimal
                        onClick={() => this.handleAddToShopping()}
                    />

                    <Button
                        text="edit me"
                        onClick={() => this.setState({ isEditMode: true })}
                        minimal
                    />

                    <Button
                        text="cooking mode"
                        onClick={() => this.setState({ isCookingMode: true })}
                        minimal
                    />
                </ActionsComp>

                <H2>{recipe.name}</H2>

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
                                icon="flash"
                                active={this.state.isScreenLockedOn}
                                onClick={() => this.toggleLockedScreen()}
                            />

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
                <ActionsComp>
                    <Button
                        text="cancel edit"
                        onClick={() =>
                            this.setState({
                                isEditMode: false,
                            })
                        }
                        minimal
                        intent="warning"
                        icon="undo"
                    />
                </ActionsComp>
                <EditRecipe
                    recipe={this.props.recipe}
                    onSaveRecipe={(newRecipe) => this.saveEdits(newRecipe)}
                />
            </div>
        );

        return this.state.isEditMode ? recipeEdit : recipeView;
    }
    handleAddToShopping() {
        // take the current recipe id and add to shopping list
        if (this.props.recipe === undefined) {
            return;
        }

        const shouldAdd = window.confirm(
            "Do you want to add to shopping list?"
        );

        if (!shouldAdd) {
            return;
        }

        GLOBAL_DATA_LAYER.addRecipesToShoppingList([this.props.recipe]);
    }
}
export function ingredientToString(
    inAmt: IngredientAmount,
    ingredient?: Ingredient
): string {
    if (ingredient === undefined) {
        ingredient = GLOBAL_DATA_LAYER.getIngredient(inAmt.ingredientId);
    }

    const unit = inAmt.unit === "" ? "" : " " + inAmt.unit;

    const modifier = inAmt.modifier === "" ? "" : ", " + inAmt.modifier;

    return `${inAmt.amount}${unit} ${ingredient?.name}${modifier}`;
}
