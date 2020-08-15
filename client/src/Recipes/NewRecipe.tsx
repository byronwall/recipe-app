import { Button, FormGroup, H3, InputGroup } from "@blueprintjs/core";
import _ from "lodash";
import React from "react";
import { handleStringChange } from "../helpers";
import { createDefaultRecipe, Ingredient, Recipe } from "../models";
import {
    convertTextToIngredientGroup,
    IngredientGroupEditor,
} from "./IngredientGroupEditor";
import { convertTextToStepGroup, StepGroupEditor } from "./StepGroupEditor";

interface NewRecipeProps {
    defaultRecipe?: Recipe;

    onSaveRecipe(newRecipe: Recipe, newIngredients: Ingredient[]): void;
}
interface NewRecipeState {
    editRecipe: Recipe;

    textSteps: string;
    textIngredients: string;
}

export class NewRecipe extends React.Component<NewRecipeProps, NewRecipeState> {
    constructor(props: NewRecipeProps) {
        super(props);

        const editRecipe = createDefaultRecipe();

        this.state = {
            editRecipe: this.props.defaultRecipe ?? editRecipe,
            textIngredients: "",
            textSteps: "",
        };
    }

    componentDidMount() {}

    componentDidUpdate(prevProps: NewRecipeProps, prevState: NewRecipeState) {
        const didPropsRecipeChange = !_.isEqual(
            this.props.defaultRecipe,
            prevProps.defaultRecipe
        );

        if (didPropsRecipeChange && this.props.defaultRecipe !== undefined) {
            // TODO: should probably clone this?
            this.setState({ editRecipe: this.props.defaultRecipe });
        }
    }

    handleRecipeEdit<K extends keyof Recipe>(key: K, value: Recipe[K]) {
        const newRecipe = _.cloneDeep(this.state.editRecipe);

        newRecipe[key] = value;

        this.setState({ editRecipe: newRecipe });
    }

    private handleRecipeSave() {
        const stepGroups = convertTextToStepGroup(this.state.textSteps);
        const {
            newIngredientGroup,
            newIngredients,
        } = convertTextToIngredientGroup(this.state.textIngredients);

        const recipeToSave = _.clone(this.state.editRecipe);
        recipeToSave.ingredientGroups = newIngredientGroup;
        recipeToSave.stepGroups = stepGroups;

        return this.props.onSaveRecipe(recipeToSave, newIngredients);
    }

    render() {
        const recipe = this.state.editRecipe;

        const isExistingRecipe = this.props.defaultRecipe !== undefined;
        return (
            <div>
                <H3>create new recipe</H3>

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

                {isExistingRecipe ? (
                    <IngredientGroupEditor
                        ingredientGroups={recipe.ingredientGroups}
                        onGroupChange={(newList) =>
                            this.handleRecipeEdit("ingredientGroups", newList)
                        }
                    />
                ) : (
                    <IngredientGroupEditor
                        textIngredients={this.state.textIngredients}
                        onTextChange={(textIngredients) =>
                            this.setState({ textIngredients })
                        }
                    />
                )}

                {isExistingRecipe ? (
                    <StepGroupEditor
                        stepGroups={recipe.stepGroups}
                        onGroupChange={(newSteps) =>
                            this.handleRecipeEdit("stepGroups", newSteps)
                        }
                    />
                ) : (
                    <StepGroupEditor
                        textSteps={this.state.textSteps}
                        onTextChange={(textSteps) =>
                            this.setState({ textSteps })
                        }
                    />
                )}

                <Button
                    text="save"
                    icon="floppy-disk"
                    onClick={() => this.handleRecipeSave()}
                />
            </div>
        );
    }
}
