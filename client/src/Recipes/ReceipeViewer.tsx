import React from "react";
import { Recipe } from "../models";
import { H2 } from "@blueprintjs/core";

interface RecipeViewerProps {
    recipe: Recipe | undefined;
}
interface RecipeViewerState {}

export class RecipeViewer extends React.Component<
    RecipeViewerProps,
    RecipeViewerState
> {
    constructor(props: RecipeViewerProps) {
        super(props);

        this.state = {};
    }

    componentDidMount() {}

    componentDidUpdate(
        prevProps: RecipeViewerProps,
        prevState: RecipeViewerState
    ) {}

    render() {
        const recipe = this.props.recipe;

        console.log("receipt", recipe);
        if (recipe === undefined) {
            return "bad id for recipe";
        }

        return (
            <div>
                <H2>{recipe.name}</H2>
            </div>
        );
    }
}
