import { Button, EditableText, H4, TextArea } from "@blueprintjs/core";
import _ from "lodash";
import React from "react";

import { GLOBAL_DATA_LAYER } from "..";
import { handleStringChange } from "../helpers";
import { getNewId, Ingredient, IngredientGroup } from "../models";
import { IngredientsEditor } from "./IngredientsEditor";

interface IngredientGroupEditorProps {
    ingredientGroups: IngredientGroup[];

    onGroupChange(newGroups: IngredientGroup[]): void;
}

interface IngredientGroupEditorState {
    isTextEditor: boolean;
    textToShow: string;
}

export class IngredientGroupEditor extends React.Component<
    IngredientGroupEditorProps,
    IngredientGroupEditorState
> {
    constructor(props: IngredientGroupEditorProps) {
        super(props);

        this.state = { textToShow: "", isTextEditor: false };
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

    processTextToSteps() {
        // get the text

        const stepsText = this.state.textToShow;

        const lines = stepsText.split("\n");

        console.log("split lines", lines);

        const newStepGroup: IngredientGroup[] = [];

        let activeGroup: IngredientGroup | undefined = undefined;

        for (let _line of lines) {
            const line = _line.trim();

            // skip blank
            if (line.trim() === "") {
                continue;
            }

            if (line.startsWith("[")) {
                // make a new group or create the first
                activeGroup = {
                    title: line.substring(1, line.length - 1),
                    ingredients: [],
                };

                newStepGroup.push(activeGroup);

                continue;
            }

            // this line is a step

            if (activeGroup === undefined) {
                // create a default group to hold first step

                activeGroup = {
                    title: "group",
                    ingredients: [],
                };
                newStepGroup.push(activeGroup);
            }

            const newIngred: Ingredient = {
                id: getNewId() - Math.random() * 10000,
                name: line,
                plu: "",
            };

            GLOBAL_DATA_LAYER.addNewIngredient(newIngred);

            activeGroup.ingredients.push({
                amount: "",
                ingredientId: newIngred.id,
                modifier: "",
                unit: "",
            });

            console.log(line);
        }

        // split into groups

        // split into steps per group

        console.log(newStepGroup);

        this.props.onGroupChange(newStepGroup);
    }

    render() {
        // TODO: add options to remove or reorder the groups
        return (
            <div>
                <p>IngredientGroupEditor</p>

                {this.props.ingredientGroups.map((grp, index) => (
                    <div key={index}>
                        <H4>
                            <EditableText
                                onChange={(newValue) =>
                                    this.handleGroupEdit(
                                        index,
                                        "title",
                                        newValue
                                    )
                                }
                                value={grp.title}
                            ></EditableText>
                        </H4>

                        <TextArea
                            value={this.state.textToShow}
                            onChange={handleStringChange((textToShow) =>
                                this.setState({ textToShow })
                            )}
                        />
                        <Button
                            text="process text area"
                            onClick={() => this.processTextToSteps()}
                        />

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
