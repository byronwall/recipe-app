import { Button, Popover } from "@blueprintjs/core";
import { DatePicker, DatePickerShortcut } from "@blueprintjs/datetime";
import React from "react";
import { Link } from "react-router-dom";

import { GLOBAL_DATA_LAYER, toastHolder } from "..";
import { Recipe } from "../models";

interface RecipeListRowProps {
    recipe: Recipe;
}
interface RecipeListRowState {
    isDatePickerOpen: boolean;
}

const today = new Date();

const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);

const tomorrow1 = new Date();
tomorrow1.setDate(today.getDate() + 2);

const tomorrow2 = new Date();
tomorrow2.setDate(today.getDate() + 3);

const shortcuts: DatePickerShortcut[] = [
    { date: today, label: "Today" },
    { date: tomorrow, label: "Tomorrow" },
    { date: tomorrow1, label: "+2 Days" },
    { date: tomorrow2, label: "+3 Days" },
];

export class RecipeListRow extends React.PureComponent<
    RecipeListRowProps,
    RecipeListRowState
> {
    public constructor(props: RecipeListRowProps) {
        super(props);

        this.state = {
            isDatePickerOpen: false,
        };
    }

    public render() {
        const { recipe } = this.props;
        const { isDatePickerOpen } = this.state;

        return (
            <tr key={recipe.id}>
                <td>{recipe.id}</td>
                <td>
                    <Link to={"/recipe/" + recipe.id}>
                        <div>{recipe.name}</div>
                    </Link>
                </td>
                <td>
                    <Button
                        icon="cross"
                        intent="danger"
                        onClick={this.handleRemoveRecipe}
                        minimal
                    />

                    <Popover
                        isOpen={isDatePickerOpen}
                        onClose={this.handleDatePickerClose}
                    >
                        <Button
                            text="meal plan..."
                            icon="calendar"
                            intent="primary"
                            minimal
                            onClick={this.handleDatePickerOpen}
                        />
                        <DatePicker
                            showActionsBar
                            shortcuts={shortcuts}
                            minDate={new Date()}
                            onChange={this.handleDateChange}
                        />
                    </Popover>
                </td>
            </tr>
        );
    }

    private handleDatePickerOpen = () => {
        this.setState({ isDatePickerOpen: true });
    };

    private handleDatePickerClose = () => {
        this.setState({ isDatePickerOpen: false });
    };

    private handleRemoveRecipe = () => {
        const shouldDelete = window.confirm(
            "Are you sure you want to delete recipe?"
        );

        if (!shouldDelete) {
            return;
        }

        const { recipe } = this.props;
        GLOBAL_DATA_LAYER.deleteRecipe(recipe.id);
    };

    private handleDateChange = (selectedDate: Date) => {
        console.log("new date", selectedDate);

        const { recipe } = this.props;

        const shouldCreateMealPlan = window.confirm(
            `Do you want to add meal plan for '${
                recipe.name
            }' on '${selectedDate.toDateString()}'?`
        );

        if (!shouldCreateMealPlan) {
            return;
        }

        // do the meal plan creation
        GLOBAL_DATA_LAYER.addMealPlanItem(selectedDate, recipe);

        toastHolder.show({ message: "Recipe was added to meal plan" });

        this.setState({ isDatePickerOpen: false });
    };
}
