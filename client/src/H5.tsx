import { H5 as _H5 } from "@blueprintjs/core";
import React from "react";

interface H5Props {}
interface H5State {}

export class H5 extends React.Component<H5Props, H5State> {
    constructor(props: H5Props) {
        super(props);

        this.state = {};
    }

    componentDidMount() {}

    componentDidUpdate(prevProps: H5Props, prevState: H5State) {}

    render() {
        return <_H5 style={{ marginBottom: 0 }}>{this.props.children}</_H5>;
    }
}
