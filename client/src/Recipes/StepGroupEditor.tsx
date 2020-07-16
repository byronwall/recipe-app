import { EditableText, H4 } from "@blueprintjs/core";
import _ from "lodash";
import React from "react";

import { RecipeStepGroup } from "../models";
import { StepsEditor } from "./StepsEditor";

interface StepGroupEditorProps {
    stepGroups: RecipeStepGroup[];

    onGroupChange(newGroups: RecipeStepGroup[]): void;
}
interface StepGroupEditorState {}

export class StepGroupEditor extends React.Component<
    StepGroupEditorProps,
    StepGroupEditorState
> {
    constructor(props: StepGroupEditorProps) {
        super(props);

        this.state = {};
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

                {this.props.stepGroups.map((grp, index) => (
                    <div>
                        <EditableText
                            onChange={(newValue) =>
                                this.handleGroupEdit(index, "title", newValue)
                            }
                        >
                            <H4>{grp.title}</H4>
                        </EditableText>
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
}
