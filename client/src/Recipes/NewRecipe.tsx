import { FormGroup, InputGroup, Button } from "@blueprintjs/core";
import _ from "lodash";
import React from "react";

import { handleStringChange } from "../helpers";
import { createDefaultRecipe, Recipe } from "../models";
import { IngredientsEditor } from "./IngredientsEditor";
import { StepsEditor } from "./StepsEditor";
import { GLOBAL_DATA_LAYER } from "..";

interface NewRecipeProps {}
interface NewRecipeState {
    editRecipe: Recipe;
}

export class NewRecipe extends React.Component<NewRecipeProps, NewRecipeState> {
    constructor(props: NewRecipeProps) {
        super(props);

        const editRecipe = createDefaultRecipe();

        this.state = { editRecipe };
    }

    componentDidMount() {}

    componentDidUpdate(prevProps: NewRecipeProps, prevState: NewRecipeState) {}

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

                <IngredientsEditor
                    ingredientsList={recipe.ingredients}
                    onIngredientsChange={(newList) =>
                        this.handleRecipeEdit("ingredients", newList)
                    }
                />

                <StepsEditor
                    steps={recipe.steps}
                    onStepsChange={(newSteps) =>
                        this.handleRecipeEdit("steps", newSteps)
                    }
                />

                <Button
                    text="save"
                    icon="floppy-disk"
                    onClick={() => this.saveNewRecipe()}
                />
            </div>
        );
    }
    saveNewRecipe() {
        GLOBAL_DATA_LAYER.saveNewRecipe(this.state.editRecipe);

        this.setState({ editRecipe: createDefaultRecipe() });
    }
}
