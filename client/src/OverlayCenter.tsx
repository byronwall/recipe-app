import { Card, Overlay } from "@blueprintjs/core";
import React from "react";

interface OverlayCenterProps {
    isOpen: boolean;
    onClose(): void;

    height: number;
    width: number;
}
interface OverlayCenterState {}

export class OverlayCenter extends React.Component<
    OverlayCenterProps,
    OverlayCenterState
> {
    constructor(props: OverlayCenterProps) {
        super(props);

        this.state = {};
    }

    componentDidMount() {}

    componentDidUpdate(
        prevProps: OverlayCenterProps,
        prevState: OverlayCenterState
    ) {}

    render() {
        return (
            <Overlay
                onClose={() => {
                    this.props.onClose();
                }}
                isOpen={this.props.isOpen}
            >
                <div
                    style={{
                        display: "flex",
                        height: "100vh",
                        width: "100vw",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: 10,
                    }}
                    onClick={() => this.props.onClose()}
                >
                    <Card
                        style={{
                            width: this.props.width,
                            height: this.props.height,
                            maxWidth: "calc(100vw - 20px)",
                            maxHeight: "calc(100vh - 20px)",

                            overflow: "auto",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {this.props.children}
                    </Card>
                </div>
            </Overlay>
        );
    }
}
