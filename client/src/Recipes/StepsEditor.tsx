import { Button, HTMLTable, InputGroup } from "@blueprintjs/core";
import _ from "lodash";
import React from "react";
import { handleStringChange } from "../helpers";
import { RecipeStep } from "../models";

interface StepsEditorProps {
    steps: RecipeStep[];

    onStepsChange(newSteps: RecipeStep[]): void;
}
interface StepsEditorState {}

export class StepsEditor extends React.Component<
    StepsEditorProps,
    StepsEditorState
> {
    constructor(props: StepsEditorProps) {
        super(props);

        this.state = {};
    }

    componentDidMount() {}

    componentDidUpdate(
        prevProps: StepsEditorProps,
        prevState: StepsEditorState
    ) {}

    handleStepEdit<K extends keyof RecipeStep>(
        index: number,
        key: K,
        value: RecipeStep[K]
    ) {
        const newSteps = _.cloneDeep(this.props.steps);
        const newStep = newSteps[index];

        newStep[key] = value;

        this.props.onStepsChange(newSteps);
    }

    render() {
        return (
            <div>
                <HTMLTable striped condensed bordered>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>duration</th>
                            <th>step</th>
                            <th>actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.steps.map((step, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>
                                    {
                                        <InputGroup
                                            placeholder="how long?"
                                            value={step.duration}
                                            onChange={handleStringChange(
                                                (duration) =>
                                                    this.handleStepEdit(
                                                        index,
                                                        "duration",
                                                        duration
                                                    )
                                            )}
                                        />
                                    }
                                </td>
                                <td>
                                    <InputGroup
                                        placeholder="what happens?"
                                        value={step.description}
                                        onChange={handleStringChange(
                                            (description) =>
                                                this.handleStepEdit(
                                                    index,
                                                    "description",
                                                    description
                                                )
                                        )}
                                    />
                                </td>
                                <td>
                                    <Button
                                        icon="cross"
                                        intent="danger"
                                        onClick={() => this.removeStep(index)}
                                    />
                                </td>
                            </tr>
                        ))}
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>
                                <Button
                                    icon="plus"
                                    intent="primary"
                                    onClick={() => this.addBlankStep()}
                                />
                            </td>
                        </tr>
                    </tbody>
                </HTMLTable>
            </div>
        );
    }
    addBlankStep() {
        const newSteps = _.cloneDeep(this.props.steps);

        newSteps.push({
            description: "",
            duration: "",
        });

        this.props.onStepsChange(newSteps);
    }
    removeStep(index: number) {
        const newSteps = _.cloneDeep(this.props.steps);

        newSteps.splice(index, 1);

        this.props.onStepsChange(newSteps);
    }
}
