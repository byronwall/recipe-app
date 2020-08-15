import { Button, Card, H5 } from "@blueprintjs/core";
import _ from "lodash";
import React from "react";
import { Link } from "react-router-dom";
import { GLOBAL_DATA_LAYER } from "..";
import { PlannedMeal } from "../models";

interface MealPlanDayProps {
    date: Date;
    mealsOnDay: PlannedMeal[];

    onShowChooserForDay(): void;
    onRemovePlannedMeal(meal: PlannedMeal): void;
}
interface MealPlanDayState {}

export class MealPlanDay extends React.Component<
    MealPlanDayProps,
    MealPlanDayState
> {
    constructor(props: MealPlanDayProps) {
        super(props);

        this.state = {};
    }

    componentDidMount() {}

    componentDidUpdate(
        prevProps: MealPlanDayProps,
        prevState: MealPlanDayState
    ) {}

    processShoppingListClick(meal: PlannedMeal) {
        const newMeal = _.cloneDeep(meal);

        if (newMeal.isOnShoppingList) {
            // need to remove from shopping list
            newMeal.isOnShoppingList = false;

            GLOBAL_DATA_LAYER.removeRecipeFromShoppingList(meal.recipeId);
        } else {
            // need to add to shopping list
            newMeal.isOnShoppingList = true;

            GLOBAL_DATA_LAYER.addRecipesToShoppingList([newMeal.recipeId]);
        }

        GLOBAL_DATA_LAYER.updateMealPlan([newMeal]);
    }

    render() {
        const isHistory = this.props.date < new Date();
        const isToday =
            this.props.date.toDateString() === new Date().toDateString();
        const backgroundColor = isToday
            ? "#AD99FF"
            : isHistory
            ? "#F5F8FA"
            : undefined;

        return (
            <Card style={{ width: 300, backgroundColor }}>
                <div className="flex" style={{ alignItems: "center" }}>
                    <H5 style={{ marginBottom: 0 }}>
                        {this.props.date.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "2-digit",
                        })}
                    </H5>

                    <Button
                        onClick={() => this.props.onShowChooserForDay()}
                        minimal
                        icon="plus"
                        intent="primary"
                    />
                </div>

                <div
                    style={{
                        display: "flex",
                    }}
                >
                    {this.props.mealsOnDay.map((meal, index) => {
                        const recipe = GLOBAL_DATA_LAYER.getRecipe(
                            meal.recipeId
                        );

                        if (recipe === undefined) {
                            return null;
                        }
                        return (
                            <div
                                key={index}
                                className="flex"
                                style={{
                                    width: 300,
                                    justifyContent: "space-between",
                                }}
                            >
                                <Link to={`/recipe/${recipe.id}`}>
                                    {recipe.name}
                                </Link>

                                <div style={{ flexShrink: 0 }}>
                                    <Button
                                        icon="shopping-cart"
                                        onClick={() =>
                                            this.processShoppingListClick(meal)
                                        }
                                        intent="primary"
                                        small
                                        active={meal.isOnShoppingList}
                                        minimal
                                    />
                                    <Button
                                        icon="cross"
                                        intent="danger"
                                        onClick={() => this.askRemoveMeal(meal)}
                                        minimal
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>
        );
    }

    private askRemoveMeal(meal: PlannedMeal) {
        const shouldRemove = window.confirm(
            "Are you sure you want to remove recipe from meal plan?"
        );
        if (!shouldRemove) {
            return;
        }
        return this.props.onRemovePlannedMeal(meal);
    }
}
