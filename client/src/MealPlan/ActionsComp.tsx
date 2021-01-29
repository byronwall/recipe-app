import { H4 } from "@blueprintjs/core";
import React from "react";

interface ActionsCompProps {}
interface ActionsCompState {}

export class ActionsComp extends React.Component<
    ActionsCompProps,
    ActionsCompState
> {
    constructor(props: ActionsCompProps) {
        super(props);

        this.state = {};
    }

    componentDidMount() {}

    componentDidUpdate(
        prevProps: ActionsCompProps,
        prevState: ActionsCompState
    ) {}

    render() {
        return (
            <div className="flex" style={{ alignItems: "center" }}>
                <H4 style={{ marginBottom: 0, color: "#5C7080" }}>actions</H4>
                <div style={{ marginLeft: 10 }}>{this.props.children}</div>
            </div>
        );
    }
}
