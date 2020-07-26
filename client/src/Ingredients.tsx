import {
    Button,
    Card,
    FormGroup,
    H4,
    HTMLTable,
    InputGroup,
} from "@blueprintjs/core";
import _ from "lodash";
import React from "react";

import { handleStringChange } from "./helpers";
import { Ingredient, IngredientAmount, Recipe } from "./models";
import {
    guessIngredientParts,
    NewIngAmt,
} from "./Recipes/ingredient_processing";

interface IngredientsProps {
    ingredients: Ingredient[];
    recipes: Recipe[];
    onSaveNewIngredient(newIngredient: Ingredient): void;
}
interface IngredientsState {
    newIngredient: Ingredient;
}

export class Ingredients extends React.Component<
    IngredientsProps,
    IngredientsState
> {
    constructor(props: IngredientsProps) {
        super(props);

        this.state = {
            newIngredient: { id: 0, name: "", plu: "", isGoodName: false },
        };
    }

    componentDidMount() {}

    componentDidUpdate(
        prevProps: IngredientsProps,
        prevState: IngredientsState
    ) {}

    handleIngredientEdit<K extends keyof Ingredient>(
        key: K,
        value: Ingredient[K]
    ) {
        const newIngredient = _.cloneDeep(this.state.newIngredient);

        newIngredient[key] = value;

        this.setState({ newIngredient: newIngredient });
    }

    render() {
        const ingredientHash: { [key: number]: IngredientAmount | null } = {};

        this.props.recipes.forEach((r) => {
            r.ingredientGroups.forEach((g) => {
                g.ingredients.forEach((i) => {
                    if (ingredientHash[i.ingredientId] === undefined) {
                        ingredientHash[i.ingredientId] = i;
                    } else {
                        ingredientHash[i.ingredientId] = null;
                    }
                });
            });
        });

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

                <Card>
                    <H4>ingredients to check</H4>

                    <p>
                        All of these are ingredients which are only used once
                        and which have not been tagged as "good"
                    </p>

                    <HTMLTable>
                        <thead>
                            <tr>
                                <th>original</th>
                                <th>new name</th>
                                <th>new amt</th>
                                <th>new unit</th>
                                <th>actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {_.values(ingredientHash)
                                .filter((c, index) => c !== null && index < 20)
                                .map((c) => c as IngredientAmount)
                                .map((c) => {
                                    const ingred = this.props.ingredients.find(
                                        (d) => d.id === c?.ingredientId
                                    );

                                    const newIng = guessIngredientParts(c);

                                    return (
                                        <tr>
                                            <td>{ingred?.name}</td>
                                            <td>{newIng?.newName}</td>
                                            <td>{newIng?.newIng.amount}</td>
                                            <td>{newIng?.newIng.unit}</td>
                                            <td>
                                                <Button
                                                    text="keep"
                                                    onClick={() =>
                                                        this.keepSuggestedIngredient(
                                                            c,
                                                            newIng
                                                        )
                                                    }
                                                    minimal
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </HTMLTable>
                </Card>

                <Card>
                    <b>current ingredients</b>

                    {this.props.ingredients.map((ingredient) => (
                        <div key={ingredient.id}>
                            {ingredient.id}|{ingredient.name}|{ingredient.plu}
                        </div>
                    ))}
                </Card>
            </div>
        );
    }
    keepSuggestedIngredient(
        c: IngredientAmount,
        newIng: NewIngAmt | undefined
    ) {
        console.log(c, newIng);

        // TODO: allow generic edits on the item

        // TODO: get each row into its own object with state for edits

        // TODO: take the suggested item and save that to the DB - update the ingredient
    }
}
