import { Button, EditableText, H3, H4, TextArea } from "@blueprintjs/core";
import _ from "lodash";
import React from "react";
import { GLOBAL_DATA_LAYER } from "..";
import { handleStringChange } from "../helpers";
import { getNewId, Ingredient, IngredientGroup } from "../models";
import { IngredientsEditor } from "./IngredientsEditor";
import { ingredientToString } from "./RecipeViewer";

interface IngredientGroupEditorProps {
    ingredientGroups?: IngredientGroup[];

    textIngredients?: string;
    onTextChange?(newText: string): void; // allow for controlled text version

    onGroupChange?(newGroups: IngredientGroup[]): void;
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

        const isControlled = props.textIngredients !== undefined;

        this.state = { textToShow: "", isTextEditor: isControlled };
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
        if (
            this.props.ingredientGroups === undefined ||
            this.props.onGroupChange === undefined
        ) {
            return;
        }

        const newSteps = _.cloneDeep(this.props.ingredientGroups);
        const newStep = newSteps[index];

        newStep[key] = value;

        this.props.onGroupChange(newSteps);
    }

    processTextToSteps() {
        // get the text
        if (this.props.onGroupChange === undefined) {
            return;
        }

        const stepsText = this.state.textToShow;

        const { newIngredientGroup } = convertTextToIngredientGroup(stepsText);

        this.setState({ isTextEditor: false });

        this.props.onGroupChange(newIngredientGroup);
    }

    render() {
        // TODO: add options to remove or reorder the groups

        const textToShow = this.props.textIngredients ?? this.state.textToShow;

        const isControlled = this.props.textIngredients !== undefined;

        const ingredientGroups = this.props.ingredientGroups ?? [];
        return (
            <div>
                <div className="flex" style={{ alignItems: "center" }}>
                    <H3 style={{ marginBottom: 0 }}>ingredients</H3>
                    <div style={{ marginLeft: 10 }}>
                        {!isControlled && (
                            <Button
                                text="show text editor"
                                active={this.state.isTextEditor}
                                onClick={() => this.toggleTextEditor()}
                                icon="edit"
                                minimal
                            />
                        )}
                    </div>
                </div>

                {this.state.isTextEditor && (
                    <div>
                        <TextArea
                            value={textToShow}
                            onChange={handleStringChange((textToShow) =>
                                this.handleTextChange(textToShow)
                            )}
                            fill
                            style={{ height: 170 }}
                        />

                        {!isControlled && (
                            <Button
                                text="convert text"
                                onClick={() => this.processTextToSteps()}
                            />
                        )}
                    </div>
                )}

                {!this.state.isTextEditor &&
                    ingredientGroups.map((grp, index) => (
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
                                    placeholder="group name"
                                ></EditableText>
                            </H4>

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

    private toggleTextEditor() {
        this.setState((prevState) => {
            // get the current ingredients and convert to string

            const textToShow = convertIngredientGroupsToString(
                this.props.ingredientGroups ?? []
            );

            return { isTextEditor: !prevState.isTextEditor, textToShow };
        });
    }

    private handleTextChange(textToShow: string): void {
        if (this.props.onTextChange !== undefined) {
            this.props.onTextChange(textToShow);
        } else {
            this.setState({ textToShow });
        }
    }
}

export function convertIngredientGroupsToString(
    ingGroups: IngredientGroup[]
): string {
    return ingGroups
        .map((grp) => {
            const ingStr = grp.ingredients
                .map((ing) => ingredientToString(ing))
                .join("\n");
            return `[${grp.title}]\n${ingStr}`;
        })
        .join("\n");
}

export function convertTextToIngredientGroup(stepsText: string) {
    const lines = stepsText.split("\n");

    console.log("split line", lines);

    const newIngredientGroup: IngredientGroup[] = [];
    const newIngredients: Ingredient[] = [];

    let activeGroup: IngredientGroup | undefined = undefined;

    for (const _line of lines) {
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

            newIngredientGroup.push(activeGroup);

            continue;
        }

        // this line is a step

        if (activeGroup === undefined) {
            // create a default group to hold first step

            activeGroup = {
                title: "",
                ingredients: [],
            };
            newIngredientGroup.push(activeGroup);
        }

        const newIngred: Ingredient = {
            id: getNewId(),
            name: line,
            plu: "",
            isGoodName: false,
            aisle: "",
            comments: "",
        };

        GLOBAL_DATA_LAYER.addNewIngredient(newIngred);
        newIngredients.push(newIngred);

        activeGroup.ingredients.push({
            amount: "",
            ingredientId: newIngred.id,
            modifier: "",
            unit: "",
        });

        console.log(line);
    }

    return { newIngredientGroup, newIngredients };
}
