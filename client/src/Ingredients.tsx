import { H3, H4, HTMLTable, InputGroup } from "@blueprintjs/core";
import _ from "lodash";
import React from "react";
import { GLOBAL_DATA_LAYER } from ".";
import { handleStringChange } from "./helpers";
import { IngredientViewEdit } from "./Ingredients/IngredientViewEdit";
import { SuggestedIngredients } from "./Ingredients/SuggestedIngredients";
import { Ingredient, Recipe } from "./models";

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
        return (
            <div>
                <H3>ingredients</H3>

                <SuggestedIngredients
                    ingredients={this.props.ingredients}
                    recipes={this.props.recipes}
                />

                <div style={{ marginTop: 10 }}>
                    <H4>all ingredients</H4>

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
                                    <th>recipes</th>
                                    <th>actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.filteredIngredients.map(
                                    (ingredient) => (
                                        <IngredientViewEdit
                                            key={ingredient.id}
                                            ingredient={ingredient}
                                            recipes={this.props.recipes}
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
                </div>
            </div>
        );
    }
}
