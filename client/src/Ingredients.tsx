import React from "react";

interface IngredientsProps {}
interface IngredientsState {}

export class Ingredients extends React.Component<
  IngredientsProps,
  IngredientsState
> {
  constructor(props: IngredientsProps) {
    super(props);

    this.state = {};
  }

  componentDidMount() {}

  componentDidUpdate(
    prevProps: IngredientsProps,
    prevState: IngredientsState
  ) {}

  render() {
    return (
      <div>
        <p>Ingredients</p>
      </div>
    );
  }
}
