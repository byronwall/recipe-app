import { Button, FormGroup, InputGroup } from "@blueprintjs/core";
import _ from "lodash";
import React from "react";
import { handleStringChange } from "../helpers";
import { createDefaultRecipe, Recipe } from "../models";
import { IngredientGroupEditor } from "./IngredientGroupEditor";
import { StepGroupEditor } from "./StepGroupEditor";

interface NewRecipeProps {
    defaultRecipe?: Recipe;

    onSaveRecipe(newRecipe: Recipe): void;
}
interface NewRecipeState {
    editRecipe: Recipe;
}

export class NewRecipe extends React.Component<NewRecipeProps, NewRecipeState> {
    constructor(props: NewRecipeProps) {
        super(props);

        const editRecipe = createDefaultRecipe();

        this.state = { editRecipe: this.props.defaultRecipe ?? editRecipe };
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

    render() {
        const recipe = this.state.editRecipe;
        return (
            <div>
                <p>NewRecipe</p>

                <p>use the controls below to create a new recipe</p>

                <FormGroup label="name">
                    <InputGroup
                        value={recipe.name}
                        onChange={handleStringChange((name) =>
                            this.handleRecipeEdit("name", name)
                        )}
                    />
                </FormGroup>

                <FormGroup label="description">
                    <InputGroup
                        value={recipe.description}
                        onChange={handleStringChange((description) =>
                            this.handleRecipeEdit("description", description)
                        )}
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
                    onClick={() =>
                        this.props.onSaveRecipe(this.state.editRecipe)
                    }
                />
            </div>
        );
    }
}
