import { Button, Card } from "@blueprintjs/core";
import _ from "lodash";
import React from "react";
import { Subscribe } from "unstated";
import { GLOBAL_DATA_LAYER } from "..";
import { DataLayer } from "../DataLayer";
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

    removeShoppingListTag(meal: PlannedMeal) {
        const newMeal = _.cloneDeep(meal);

        newMeal.isOnShoppingList = false;

        GLOBAL_DATA_LAYER.updateMealPlan([newMeal]);
    }

    render() {
        return (
            <Subscribe to={[DataLayer]}>
                {(data: DataLayer) => (
                    <Card>
                        <p>{this.props.date.toDateString()}</p>

                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                            {this.props.mealsOnDay.map((meal, index) => {
                                const recipe = data.state.recipes.find(
                                    (c) => c.id === meal.recipeId
                                );

                                if (recipe === undefined) {
                                    return null;
                                }
                                return (
                                    <Card key={index}>
                                        {meal.isOnShoppingList && (
                                            <Button
                                                icon="shopping-cart"
                                                onClick={() =>
                                                    this.removeShoppingListTag(
                                                        meal
                                                    )
                                                }
                                                intent="primary"
                                                small
                                                active
                                                minimal
                                            />
                                        )}
                                        {recipe.name}
                                        <Button
                                            icon="cross"
                                            intent="danger"
                                            onClick={() =>
                                                this.props.onRemovePlannedMeal(
                                                    meal
                                                )
                                            }
                                            minimal
                                        />
                                    </Card>
                                );
                            })}

                            <div>
                                <Button
                                    text="add new"
                                    onClick={() =>
                                        this.props.onShowChooserForDay()
                                    }
                                />
                            </div>
                        </div>
                    </Card>
                )}
            </Subscribe>
        );
    }
}
