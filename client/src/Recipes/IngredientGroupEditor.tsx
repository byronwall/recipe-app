import { EditableText, H4 } from "@blueprintjs/core";
import _ from "lodash";
import React from "react";

import { IngredientGroup } from "../models";
import { IngredientsEditor } from "./IngredientsEditor";

interface IngredientGroupEditorProps {
    ingredientGroups: IngredientGroup[];

    onGroupChange(newGroups: IngredientGroup[]): void;
}

interface IngredientGroupEditorState {}

export class IngredientGroupEditor extends React.Component<
    IngredientGroupEditorProps,
    IngredientGroupEditorState
> {
    constructor(props: IngredientGroupEditorProps) {
        super(props);

        this.state = {};
    }

    componentDidMount() {}

    componentDidUpdate(
        prevProps: IngredientGroupEditorProps,
        prevState: IngredientGroupEditorState
    ) {}

    handleGroupEdit<K extends keyof IngredientGroup>(
        index: number,
        key: K,
        value: IngredientGroup[K]
    ) {
        const newSteps = _.cloneDeep(this.props.ingredientGroups);
        const newStep = newSteps[index];

        newStep[key] = value;

        this.props.onGroupChange(newSteps);
    }

    render() {
        // TODO: add options to remove or reorder the groups
        return (
            <div>
                <p>IngredientGroupEditor</p>

                {this.props.ingredientGroups.map((grp, index) => (
                    <div key={index}>
                        <EditableText
                            onChange={(newValue) =>
                                this.handleGroupEdit(index, "title", newValue)
                            }
                        >
                            <H4>{grp.title}</H4>
                        </EditableText>
                        <IngredientsEditor
                            ingredientsList={grp.ingredients}
                            onIngredientsChange={(newSteps) =>
                                this.handleGroupEdit(
                                    index,
                                    "ingredients",
                                    newSteps
                                )
                            }
                        />
                    </div>
                ))}
            </div>
        );
    }
}
