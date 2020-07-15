import { Button, HTMLTable, InputGroup, NumericInput } from "@blueprintjs/core";
import _ from "lodash";
import React from "react";

import { handleStringChange } from "../helpers";
import { IngredientAmount } from "../models";
import { IngredientChooser } from "./IngredientChooser";
import { GLOBAL_DATA_LAYER } from "..";

interface IngredientsEditorProps {
    ingredientsList: IngredientAmount[];
    onIngredientsChange(newList: IngredientAmount[]): void;
}
interface IngredientsEditorState {
    newIngredient: IngredientAmount;
}

export class IngredientsEditor extends React.Component<
    IngredientsEditorProps,
    IngredientsEditorState
> {
    constructor(props: IngredientsEditorProps) {
        super(props);

        const newIngredient: IngredientAmount = {
            amount: 0,
            ingredientId: 0,
            modifier: "",
            unit: "",
        };

        this.state = { newIngredient };
    }

    componentDidMount() {}

    componentDidUpdate(
        prevProps: IngredientsEditorProps,
        prevState: IngredientsEditorState
    ) {}

    handleIngredientAmountEdit<K extends keyof IngredientAmount>(
        index: number,
        key: K,
        value: IngredientAmount[K]
    ) {
        const newItems = _.cloneDeep(this.props.ingredientsList);
        const newItem = newItems[index];

        newItem[key] = value;

        this.props.onIngredientsChange(newItems);
    }

    handleNewIngredientAmountEdit<K extends keyof IngredientAmount>(
        key: K,
        value: IngredientAmount[K]
    ) {
        const newItem = _.cloneDeep(this.state.newIngredient);

        newItem[key] = value;

        this.setState({ newIngredient: newItem });
    }

    render() {
        const newIngredient = this.state.newIngredient;
        return (
            <div>
                <p>IngredientsEditor</p>

                <HTMLTable>
                    <thead>
                        <tr>
                            <th>amount</th>
                            <th>unit</th>
                            <th>item</th>
                            <th>modifier</th>
                            <th>actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.ingredientsList.map((inAmt, index) => (
                            <tr key={index}>
                                <td>
                                    <NumericInput
                                        value={inAmt.amount}
                                        onValueChange={(newVal) =>
                                            this.handleIngredientAmountEdit(
                                                index,
                                                "amount",
                                                newVal
                                            )
                                        }
                                    />
                                </td>

                                <td>
                                    <InputGroup
                                        value={inAmt.unit}
                                        onChange={handleStringChange((unit) =>
                                            this.handleIngredientAmountEdit(
                                                index,
                                                "unit",
                                                unit
                                            )
                                        )}
                                    />
                                </td>
                                <td>
                                    <IngredientChooser
                                        onItemChange={(newIngredient) => {
                                            GLOBAL_DATA_LAYER.addNewIngredient(
                                                newIngredient
                                            );
                                            this.handleIngredientAmountEdit(
                                                index,
                                                "ingredientId",
                                                newIngredient.id
                                            );
                                        }}
                                    />
                                </td>
                                <td>
                                    <InputGroup
                                        value={inAmt.modifier}
                                        onChange={handleStringChange(
                                            (modifier) =>
                                                this.handleIngredientAmountEdit(
                                                    index,
                                                    "modifier",
                                                    modifier
                                                )
                                        )}
                                    />
                                </td>
                                <td>
                                    <Button
                                        icon="cross"
                                        intent="danger"
                                        onClick={() =>
                                            this.removeIngredient(index)
                                        }
                                    />
                                </td>
                            </tr>
                        ))}
                        <tr>
                            <td>
                                <NumericInput
                                    value={newIngredient.amount}
                                    onValueChange={(newVal) =>
                                        this.handleNewIngredientAmountEdit(
                                            "amount",
                                            newVal
                                        )
                                    }
                                />
                            </td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>
                                <Button
                                    icon="plus"
                                    text="add"
                                    intent="primary"
                                    onClick={() => this.addNewToRecipe()}
                                />
                            </td>
                        </tr>
                    </tbody>
                </HTMLTable>
            </div>
        );
    }
    removeIngredient(index: number) {
        const newItems = _.cloneDeep(this.props.ingredientsList);

        newItems.splice(index, 1);

        this.props.onIngredientsChange(newItems);
    }
    addNewToRecipe() {
        // add the state one to the list
        const newItems = _.cloneDeep(this.props.ingredientsList);

        newItems.push(this.state.newIngredient);

        this.props.onIngredientsChange(newItems);

        // blank out the new one
    }
}
