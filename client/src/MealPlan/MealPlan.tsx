import React from "react";

import { PlannedMeal, Recipe } from "../models";
import { MealPlanDay } from "./MealPlanDay";
import { RecipeChooser } from "./RecipeChooser";
import { GLOBAL_DATA_LAYER } from "..";

interface MealPlanProps {
    meals: PlannedMeal[];
}
interface MealPlanState {
    isRecipeChooserOpen: boolean;

    dateToAddRecipe: Date | undefined;
}

export class MealPlan extends React.Component<MealPlanProps, MealPlanState> {
    constructor(props: MealPlanProps) {
        super(props);

        this.state = { isRecipeChooserOpen: false, dateToAddRecipe: undefined };
    }

    componentDidMount() {}

    componentDidUpdate(prevProps: MealPlanProps, prevState: MealPlanState) {}

    addRecipeForActiveDay(recipe: Recipe): void {
        const date = this.state.dateToAddRecipe;

        GLOBAL_DATA_LAYER.addMealPlanItem(date, recipe);

        this.setState({
            dateToAddRecipe: undefined,
            isRecipeChooserOpen: false,
        });
    }

    render() {
        // by default, show the next 2 weeks and previous 1 week -- allow for scrolling to show more
        // center on today

        // each day needs a button to add a new recipe on that day - open a chooser
        // allow for a manual entry - choose the day

        // button to create a shopping list from all of the planned meals in the next 2 weeks

        // TODO: cache this stuff out somewhere better

        const msInDay = 24 * 3600 * 1000;
        const startOfView = new Date(new Date().getTime() - 7 * msInDay);
        const endOfView = new Date(new Date().getTime() + 14 * msInDay);
        const today = new Date();

        const daysToShow = getDaysBetween(startOfView, endOfView);

        return (
            <div>
                <p>MealPlan</p>

                <div>
                    <p>
                        showing meals from {startOfView.toDateString()} to{" "}
                        {endOfView.toDateString()}
                    </p>
                    <p>today is {today.toDateString()}</p>

                    {daysToShow.map((day) => (
                        <MealPlanDay
                            key={day.toDateString()}
                            date={day}
                            mealsOnDay={GLOBAL_DATA_LAYER.state.plannedMeals.filter(
                                (c) =>
                                    c.date.toDateString() === day.toDateString()
                            )}
                            onShowChooserForDay={() => {
                                this.setState({
                                    isRecipeChooserOpen: true,
                                    dateToAddRecipe: day,
                                });
                            }}
                            onRemovePlannedMeal={(meal) =>
                                GLOBAL_DATA_LAYER.deletePlannedMeal(meal)
                            }
                        />
                    ))}
                </div>

                <RecipeChooser
                    isOpen={this.state.isRecipeChooserOpen}
                    onClose={() =>
                        this.setState({ isRecipeChooserOpen: false })
                    }
                    onSelect={(recipe) => this.addRecipeForActiveDay(recipe)}
                />
            </div>
        );
    }
}

export function getDaysBetween(start: Date, end: Date) {
    for (
        var arr = [], dt = new Date(start);
        dt <= end;
        dt.setDate(dt.getDate() + 1)
    ) {
        arr.push(new Date(dt));
    }
    return arr;
}
