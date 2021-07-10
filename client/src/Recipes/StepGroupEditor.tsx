import { Button, EditableText, H3, H4, TextArea } from "@blueprintjs/core";
import _ from "lodash";
import React from "react";
import { globalLog } from "..";
import { handleStringChange } from "../helpers";
import { RecipeStepGroup } from "../models";
import { StepsEditor } from "./StepsEditor";

interface StepGroupEditorProps {
    stepGroups?: RecipeStepGroup[];
    onGroupChange?(newGroups: RecipeStepGroup[]): void;

    textSteps?: string;
    onTextChange?(newText: string): void; // allow for controlled text version
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

        const isTextInput = this.props.textSteps !== undefined;

        this.state = { isTextEditor: isTextInput, textToShow: "" };
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
        if (
            this.props.stepGroups === undefined ||
            this.props.onGroupChange === undefined
        ) {
            return;
        }
        const newSteps = _.cloneDeep(this.props.stepGroups);
        const newStep = newSteps[index];

        newStep[key] = value;

        this.props.onGroupChange(newSteps);
    }

    get isControlled() {
        return this.props.textSteps !== undefined;
    }

    render() {
        // TODO: add options to remove or reorder the groups

        const textToShow = this.isControlled
            ? this.props.textSteps
            : this.state.textToShow;

        const stepGroups = this.props.stepGroups ?? [];
        return (
            <div>
                <div className="flex" style={{ alignItems: "center" }}>
                    <H3 style={{ marginBottom: 0 }}>steps</H3>
                    <div style={{ marginLeft: 10 }}>
                        {!this.isControlled && (
                            <div>
                                <Button
                                    active={this.state.isTextEditor}
                                    text="show text editor"
                                    onClick={() => this.toggleTextEditor()}
                                    minimal
                                    icon="edit"
                                />
                            </div>
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

                        {!this.isControlled && (
                            <Button
                                text="convert to steps"
                                onClick={() => this.processTextToSteps()}
                            />
                        )}
                    </div>
                )}

                {!this.state.isTextEditor &&
                    stepGroups.map((grp, index) => (
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
                                    placeholder="enter group name"
                                />
                            </H4>
                            <StepsEditor
                                steps={grp.steps}
                                onStepsChange={(newSteps) =>
                                    this.handleGroupEdit(
                                        index,
                                        "steps",
                                        newSteps
                                    )
                                }
                            />
                        </div>
                    ))}
            </div>
        );
    }
    private handleTextChange(textToShow: string): void {
        if (this.isControlled) {
            if (this.props.onTextChange !== undefined) {
                this.props.onTextChange(textToShow);
            }
        } else {
            this.setState({ textToShow });
        }
    }

    processTextToSteps() {
        // get the text

        if (this.props.onGroupChange === undefined) {
            return;
        }

        const stepsText = this.state.textToShow;

        const newStepGroup = convertTextToStepGroup(stepsText);

        this.props.onGroupChange(newStepGroup);
    }

    private toggleTextEditor() {
        const stepGroups = this.props.stepGroups ?? [];
        const newText = stepGroups.map(groupToString).join("\n");

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

export function convertTextToStepGroup(stepsText: string) {
    const lines = stepsText.split("\n");

    globalLog("split lines", lines);

    const newStepGroup: RecipeStepGroup[] = [];

    let activeGroup: RecipeStepGroup | undefined = undefined;

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
                steps: [],
            };

            newStepGroup.push(activeGroup);

            continue;
        }

        // this line is a step

        if (activeGroup === undefined) {
            // create a default group to hold first step

            activeGroup = {
                title: "",
                steps: [],
            };
            newStepGroup.push(activeGroup);
        }

        activeGroup.steps.push({ description: line, duration: "0" });

        globalLog(line);
    }

    // split into groups

    // split into steps per group

    globalLog(newStepGroup);

    return newStepGroup;
}
