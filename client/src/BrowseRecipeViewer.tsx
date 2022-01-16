import { Button, H2, H3, Spinner } from "@blueprintjs/core";
import axios from "axios";
import React from "react";
import { GLOBAL_DATA_LAYER, toastHolder } from ".";
import { ActionsComp } from "./MealPlan/ActionsComp";
import {
    createDefaultRecipe,
    ParsedRecipeData,
    RecipeDataParams,
    RecipeSearchData,
} from "./models";
import { convertTextToIngredientGroup } from "./Recipes/IngredientGroupEditor";
import { convertTextToStepGroup } from "./Recipes/StepGroupEditor";

interface BrowseRecipeViewerProps {
    activeItem: RecipeSearchData | undefined;
}
interface BrowseRecipeViewerState {
    recipeData: ParsedRecipeData | undefined;
    isSaveButtonActive: boolean;
}

export class BrowseRecipeViewer extends React.Component<
    BrowseRecipeViewerProps,
    BrowseRecipeViewerState
> {
    constructor(props: BrowseRecipeViewerProps) {
        super(props);

        this.state = { recipeData: undefined, isSaveButtonActive: true };
    }

    componentDidMount() {
        this.parseRecipe();
    }

    /** Load the recipe info from site */
    async parseRecipe() {
        // fire off a post to the serve

        if (this.props.activeItem === undefined) {
            return;
        }

        const postData: RecipeDataParams = {
            url: this.props.activeItem.url,
        };

        const res = await axios.post("/api/recipe_data", postData);

        const data = res.data as ParsedRecipeData;

        this.setState({ recipeData: data });
    }

    componentDidUpdate(
        prevProps: BrowseRecipeViewerProps,
        prevState: BrowseRecipeViewerState
    ) {}

    render() {
        if (this.props.activeItem === undefined) {
            return null;
        }

        return (
            <div>
                <ActionsComp>
                    <Button
                        text="save recipe"
                        icon="floppy-disk"
                        intent="success"
                        minimal
                        onClick={() => this.handleRecipeSave()}
                        disabled={!this.state.isSaveButtonActive}
                    />

                    <a
                        href={this.props.activeItem.url}
                        target="_blank"
                        rel="noreferrer"
                    >
                        show on All Recipes
                    </a>
                </ActionsComp>

                <div className="flex" style={{ alignItems: "center" }}>
                    <H2>{this.props.activeItem.name}</H2>
                </div>
                <img
                    style={{ maxWidth: "100%" }}
                    src={this.props.activeItem.imageUrl}
                />

                {this.state.recipeData === undefined && <Spinner />}

                {this.state.recipeData !== undefined && (
                    <div>
                        <H3>stats</H3>
                        <div>prep time: {this.state.recipeData.prepTime}</div>
                        <div>cook time: {this.state.recipeData.cookTime}</div>
                        <div>total time: {this.state.recipeData.totalTime}</div>
                        <div>servings: {this.state.recipeData.servings}</div>

                        <H3>ingredients</H3>

                        {this.state.recipeData?.ingredients.map((ing, idx) => (
                            <p key={idx}>{ing}</p>
                        ))}

                        <H3>steps</H3>

                        {this.state.recipeData?.steps.map((ing, idx) => (
                            <p key={idx}>{ing}</p>
                        ))}
                    </div>
                )}
            </div>
        );
    }
    handleRecipeSave() {
        if (
            this.state.recipeData === undefined ||
            this.props.activeItem === undefined
        ) {
            return;
        }

        this.setState({ isSaveButtonActive: false });

        const stepGroups = convertTextToStepGroup(
            this.state.recipeData.steps.join("\n")
        );

        const {
            newIngredientGroup,
            newIngredients,
        } = convertTextToIngredientGroup(
            this.state.recipeData.ingredients.join("\n")
        );

        const recipeToSave = createDefaultRecipe();
        recipeToSave.name = this.props.activeItem.name;
        recipeToSave.description = this.props.activeItem.url;
        recipeToSave.ingredientGroups = newIngredientGroup;
        recipeToSave.stepGroups = stepGroups;

        GLOBAL_DATA_LAYER.saveNewRecipe(recipeToSave, newIngredients);

        toastHolder.show({
            message: "Recipe saved",
            intent: "success",
        });
    }
}
