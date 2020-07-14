import React from "react"
import { Card, FormGroup, InputGroup, Button } from "@blueprintjs/core"
import { Ingredient } from "./models"
import _ from "lodash"
import { handleStringChange } from "./helpers"

interface IngredientsProps {
    ingredients: Ingredient[]
    onSaveNewIngredient(newIngredient: Ingredient): void
}
interface IngredientsState {
    newIngredient: Ingredient
}

export class Ingredients extends React.Component<
    IngredientsProps,
    IngredientsState
> {
    constructor(props: IngredientsProps) {
        super(props)

        this.state = { newIngredient: { id: 0, name: "", plu: "" } }
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
        const newIngredient = _.cloneDeep(this.state.newIngredient)

        newIngredient[key] = value

        this.setState({ newIngredient: newIngredient })
    }

    render() {
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
                    <b>current ingredients</b>

                    {this.props.ingredients.map((ingredient) => (
                        <div key={ingredient.id}>
                            {ingredient.id}|{ingredient.name}|{ingredient.plu}
                        </div>
                    ))}
                </Card>
            </div>
        )
    }
}
