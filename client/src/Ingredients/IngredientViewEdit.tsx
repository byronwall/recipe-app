import React from "react";
import { Ingredient } from "../models";
import _ from "lodash";
import { EditableText, Button } from "@blueprintjs/core";

interface IngredientViewEditProps {
    ingredient: Ingredient;

    onSaveChanges(newIngredient: Ingredient): void;
}
interface IngredientViewEditState {
    editIngredient: Ingredient;
}

export class IngredientViewEdit extends React.Component<
    IngredientViewEditProps,
    IngredientViewEditState
> {
    constructor(props: IngredientViewEditProps) {
        super(props);

        this.state = { editIngredient: props.ingredient };
    }

    get isDirty() {
        return !_.isEqual(this.props.ingredient, this.state.editIngredient);
    }

    componentDidMount() {}

    componentDidUpdate(
        prevProps: IngredientViewEditProps,
        prevState: IngredientViewEditState
    ) {
        const didPropsChange = !_.isEqual(
            this.props.ingredient,
            prevProps.ingredient
        );

        if (didPropsChange) {
            this.setState({
                editIngredient: _.cloneDeep(this.props.ingredient),
            });
        }
    }

    handleIngredientEdit<K extends keyof Ingredient>(
        key: K,
        value: Ingredient[K]
    ) {
        const newEditIngredient = _.cloneDeep(this.state.editIngredient);

        newEditIngredient[key] = value;

        this.setState({ editIngredient: newEditIngredient });
    }

    render() {
        return (
            <div className="flex">
                <div>
                    <EditableText
                        value={this.state.editIngredient.name.trim()}
                        onChange={(name) =>
                            this.handleIngredientEdit("name", name)
                        }
                    />
                </div>

                {this.isDirty && (
                    <Button
                        icon="floppy-disk"
                        minimal
                        onClick={() => this.saveChanges()}
                    />
                )}
            </div>
        );
    }
    saveChanges(): void {
        console.log("save changes", this.state.editIngredient);
        this.props.onSaveChanges(this.state.editIngredient);
    }
}
