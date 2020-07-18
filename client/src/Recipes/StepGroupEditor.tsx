import { Button, EditableText, H4, TextArea } from "@blueprintjs/core";
import _ from "lodash";
import React from "react";

import { handleStringChange } from "../helpers";
import { RecipeStepGroup } from "../models";
import { StepsEditor } from "./StepsEditor";

interface StepGroupEditorProps {
    stepGroups: RecipeStepGroup[];

    onGroupChange(newGroups: RecipeStepGroup[]): void;
}
interface StepGroupEditorState {
    isTextEditor: boolean;
    textToShow: string;
}

export class StepGroupEditor extends React.Component<
    StepGroupEditorProps,
    StepGroupEditorState
> {
    constructor(props: StepGroupEditorProps) {
        super(props);

        this.state = { isTextEditor: false, textToShow: "" };
    }

    componentDidMount() {}

    componentDidUpdate(
        prevProps: StepGroupEditorProps,
        prevState: StepGroupEditorState
    ) {}

    handleGroupEdit<K extends keyof RecipeStepGroup>(
        index: number,
        key: K,
        value: RecipeStepGroup[K]
    ) {
        const newSteps = _.cloneDeep(this.props.stepGroups);
        const newStep = newSteps[index];

        newStep[key] = value;

        this.props.onGroupChange(newSteps);
    }

    render() {
        // TODO: add options to remove or reorder the groups
        return (
            <div>
                <p>StepGroupEditor</p>

                <div>
                    <Button
                        active={this.state.isTextEditor}
                        text="text editor"
                        onClick={() => this.toggleTextEditor()}
                    />
                </div>

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

                {this.props.stepGroups.map((grp, index) => (
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
                        <StepsEditor
                            steps={grp.steps}
                            onStepsChange={(newSteps) =>
                                this.handleGroupEdit(index, "steps", newSteps)
                            }
                        />
                    </div>
                ))}
            </div>
        );
    }
    processTextToSteps() {
        // get the text

        const stepsText = this.state.textToShow;

        const lines = stepsText.split("\n");

        console.log("split lines", lines);

        const newStepGroup: RecipeStepGroup[] = [];

        let activeGroup: RecipeStepGroup | undefined = undefined;

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
                    steps: [],
                };

                newStepGroup.push(activeGroup);

                continue;
            }

            // this line is a step

            if (activeGroup === undefined) {
                // create a default group to hold first step

                activeGroup = {
                    title: "group",
                    steps: [],
                };
                newStepGroup.push(activeGroup);
            }

            activeGroup.steps.push({ description: line, duration: "0" });

            console.log(line);
        }

        // split into groups

        // split into steps per group

        console.log(newStepGroup);

        this.props.onGroupChange(newStepGroup);
    }

    private toggleTextEditor() {
        const newText = this.props.stepGroups.map(groupToString).join("\n");

        return this.setState((prevState) => ({
            isTextEditor: !prevState.isTextEditor,
            textToShow: newText,
        }));
    }
}

export function groupToString(grp: RecipeStepGroup): string {
    const stepsStr = grp.steps.map((step) => step.description).join("\n");
    return `[${grp.title}]\n${stepsStr}\n`;
}
