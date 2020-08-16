import { Button, FormGroup, H2, InputGroup } from "@blueprintjs/core";
import _ from "lodash";
import React from "react";
import { handleStringChange } from "../helpers";
import { createDefaultRecipe, Ingredient, Recipe } from "../models";
import { IngredientGroupEditor } from "./IngredientGroupEditor";
import { StepGroupEditor } from "./StepGroupEditor";

interface EditRecipeProps {
    recipe: Recipe | undefined;

    onSaveRecipe(newRecipe: Recipe, newIngredients?: Ingredient[]): void;
}
interface EditRecipeState {
    editRecipe: Recipe;
}

export class EditRecipe extends React.Component<
    EditRecipeProps,
    EditRecipeState
> {
    constructor(props: EditRecipeProps) {
        super(props);

        const editRecipe = createDefaultRecipe();

        this.state = {
            editRecipe: this.props.recipe ?? editRecipe,
        };
    }

    componentDidMount() {}

    componentDidUpdate(prevProps: EditRecipeProps, prevState: EditRecipeState) {
        const didPropsRecipeChange = !_.isEqual(
            this.props.recipe,
            prevProps.recipe
        );

        if (didPropsRecipeChange && this.props.recipe !== undefined) {
            // TODO: should probably clone this?
            this.setState({ editRecipe: this.props.recipe });
        }
    }

    handleRecipeEdit<K extends keyof Recipe>(key: K, value: Recipe[K]) {
        const newRecipe = _.cloneDeep(this.state.editRecipe);

        newRecipe[key] = value;

        this.setState({ editRecipe: newRecipe });
    }

    private handleRecipeSave() {
        const recipeToSave = this.state.editRecipe;

        return this.props.onSaveRecipe(recipeToSave);
    }

    render() {
        const recipe = this.state.editRecipe;

        return (
            <div>
                <H2>edit recipe</H2>

                <FormGroup label="name" inline>
                    <InputGroup
                        value={recipe.name}
                        onChange={handleStringChange((name) =>
                            this.handleRecipeEdit("name", name)
                        )}
                        placeholder="recipe name"
                    />
                </FormGroup>

                <FormGroup label="description" inline>
                    <InputGroup
                        value={recipe.description}
                        onChange={handleStringChange((description) =>
                            this.handleRecipeEdit("description", description)
                        )}
                        placeholder="recipe description"
                    />
                </FormGroup>

                <IngredientGroupEditor
                    ingredientGroups={recipe.ingredientGroups}
                    onGroupChange={(newList) =>
                        this.handleRecipeEdit("ingredientGroups", newList)
                    }
                />

                <StepGroupEditor
                    stepGroups={recipe.stepGroups}
                    onGroupChange={(newSteps) =>
                        this.handleRecipeEdit("stepGroups", newSteps)
                    }
                />

                <Button
                    text="save"
                    icon="floppy-disk"
                    onClick={() => this.handleRecipeSave()}
                />
            </div>
        );
    }
}
