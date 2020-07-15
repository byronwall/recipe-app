import React from "react";

interface HomePageProps {}
interface HomePageState {}

export class HomePage extends React.Component<HomePageProps, HomePageState> {
    constructor(props: HomePageProps) {
        super(props);

        this.state = {};
    }

    componentDidMount() {}

    componentDidUpdate(prevProps: HomePageProps, prevState: HomePageState) {}

    render() {
        return (
            <div>
                <p>HomePage</p>
            </div>
        );
    }
}
