import {
    Button,
    Card,
    FormGroup,
    InputGroup,
    H4,
    HTMLTable,
} from "@blueprintjs/core";
import _ from "lodash";
import React from "react";

import { handleStringChange } from "./helpers";
import { SuggestedIngredients } from "./Ingredients/SuggestedIngredients";
import { Ingredient, Recipe } from "./models";
import { IngredientViewEdit } from "./Ingredients/IngredientViewEdit";
import { GLOBAL_DATA_LAYER } from ".";

interface IngredientsProps {
    ingredients: Ingredient[];
    recipes: Recipe[];
    onSaveNewIngredient(newIngredient: Ingredient): void;
}
interface IngredientsState {
    newIngredient: Ingredient;

    searchText: string;

    filteredIngredients: Ingredient[];
}

export class Ingredients extends React.Component<
    IngredientsProps,
    IngredientsState
> {
    constructor(props: IngredientsProps) {
        super(props);

        this.state = {
            newIngredient: {
                id: 0,
                name: "",
                plu: "",
                isGoodName: false,
                aisle: "",
                comments: "",
            },
            searchText: "",
            filteredIngredients: props.ingredients.slice(0, 20),
        };
    }

    componentDidMount() {}

    componentDidUpdate(
        prevProps: IngredientsProps,
        prevState: IngredientsState
    ) {
        const didSearchChange = this.state.searchText !== prevState.searchText;
        const didIngredientsChange = !_.isEqual(
            this.props.ingredients,
            prevProps.ingredients
        );

        if (didSearchChange || didIngredientsChange) {
            const filteredIngredients = _.sortBy(
                _.shuffle(
                    this.props.ingredients.filter(
                        (c) =>
                            this.state.searchText === "" ||
                            c.name
                                .toUpperCase()
                                .indexOf(this.state.searchText.toUpperCase()) >
                                -1
                    )
                ),
                (c) => c.isGoodName
            ).slice(0, 20);

            this.setState({ filteredIngredients });
        }
    }

    handleIngredientEdit<K extends keyof Ingredient>(
        key: K,
        value: Ingredient[K]
    ) {
        const newIngredient = _.cloneDeep(this.state.newIngredient);

        newIngredient[key] = value;

        this.setState({ newIngredient: newIngredient });
    }

    render() {
        console.log("ingred render", this.state.filteredIngredients);
        return (
            <div>
                <p>Ingredients</p>

                <Card>
                    <b>add new ingredient</b>

                    <FormGroup label="name">
                        <InputGroup
                            placeholder="name"
                            value={this.state.newIngredient.name}
                            onChange={handleStringChange((name) =>
                                this.handleIngredientEdit("name", name)
                            )}
                        />
                    </FormGroup>

                    <FormGroup label="PLU">
                        <InputGroup
                            placeholder="plu"
                            value={this.state.newIngredient.plu}
                            onChange={handleStringChange((plu) =>
                                this.handleIngredientEdit("plu", plu)
                            )}
                        />
                    </FormGroup>

                    <Button
                        text="save"
                        intent="primary"
                        onClick={() =>
                            this.props.onSaveNewIngredient(
                                this.state.newIngredient
                            )
                        }
                    />
                </Card>

                <SuggestedIngredients
                    ingredients={this.props.ingredients}
                    recipes={this.props.recipes}
                />

                <Card>
                    <H4>
                        current ingredients ({this.props.ingredients.length})
                    </H4>

                    <InputGroup
                        value={this.state.searchText}
                        onChange={handleStringChange((searchText) =>
                            this.setState({ searchText: searchText })
                        )}
                    />

                    <div>
                        <HTMLTable condensed striped bordered>
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>name</th>
                                    <th>comments</th>
                                    <th>plu</th>
                                    <th>aisle</th>
                                    <th>actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.filteredIngredients.map(
                                    (ingredient) => (
                                        <IngredientViewEdit
                                            key={ingredient.id}
                                            ingredient={ingredient}
                                            onSaveChanges={(newIngred) =>
                                                GLOBAL_DATA_LAYER.updateIngredient(
                                                    newIngred
                                                )
                                            }
                                        />
                                    )
                                )}
                            </tbody>
                        </HTMLTable>
                    </div>
                </Card>
            </div>
        );
    }
}
