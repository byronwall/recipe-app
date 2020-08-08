import { Button } from "@blueprintjs/core";
import _ from "lodash";
import React from "react";
import { GLOBAL_DATA_LAYER } from "..";
import { getNewId, PlannedMeal, Recipe, ShoppingListItem } from "../models";
import { MealPlanDay } from "./MealPlanDay";
import { RecipeChooser } from "./RecipeChooser";

interface MealPlanProps {
    meals: PlannedMeal[];
}
interface MealPlanState {
    isRecipeChooserOpen: boolean;

    dateToAddRecipe: Date | undefined;

    viewSettings: MealPlanViewSettings;
}

interface MealPlanViewSettings {
    today: Date;
    startOfView: Date;
    endOfView: Date;

    daysToShow: Date[];
}

const msInDay = 24 * 3600 * 1000;

export class MealPlan extends React.Component<MealPlanProps, MealPlanState> {
    constructor(props: MealPlanProps) {
        super(props);

        this.state = {
            isRecipeChooserOpen: false,
            dateToAddRecipe: undefined,
            viewSettings: createDefaultView(),
        };
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

    addNewToShoppingList() {
        // find the items that are visible
        const startDate = this.state.viewSettings.startOfView;
        const endDate = this.state.viewSettings.endOfView;
        const visibleItems = this.props.meals
            .filter((c) => c.date <= endDate && c.date >= startDate)
            .filter((c) => !c.isOnShoppingList);

        // find those not already added

        // add to shopping list
        const recipes = visibleItems.map((c) =>
            GLOBAL_DATA_LAYER.getRecipe(c.recipeId)
        );
        console.log("add items", visibleItems, recipes);

        const newShopItems: ShoppingListItem[] = [];

        recipes.forEach((rec) => {
            rec?.ingredientGroups.forEach((c) =>
                c.ingredients.forEach((ing) => {
                    newShopItems.push({
                        ingredientAmount: ing,
                        recipeId: rec.id,
                        isBought: false,
                        id: getNewId(),
                    });
                })
            );
        });

        GLOBAL_DATA_LAYER.addItemsToShoppingList(newShopItems);

        const newMeal = _.cloneDeep(visibleItems);
        newMeal.forEach((c) => (c.isOnShoppingList = true));

        GLOBAL_DATA_LAYER.updateMealPlan(newMeal);
    }

    render() {
        // by default, show the next 2 weeks and previous 1 week -- allow for scrolling to show more
        // center on today

        // each day needs a button to add a new recipe on that day - open a chooser
        // allow for a manual entry - choose the day

        // button to create a shopping list from all of the planned meals in the next 2 weeks

        // TODO: cache this stuff out somewhere better

        const {
            startOfView,
            endOfView,
            today,
            daysToShow,
        } = this.state.viewSettings;

        return (
            <div>
                <p>MealPlan</p>

                <Button
                    text="add to shopping list"
                    onClick={() => this.addNewToShoppingList()}
                />

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

function createDefaultView(
    daysBack = 7,
    daysForward = 14
): MealPlanViewSettings {
    const startOfView = new Date(new Date().getTime() - daysBack * msInDay);
    const endOfView = new Date(new Date().getTime() + daysForward * msInDay);
    const today = new Date();

    const daysToShow = getDaysBetween(startOfView, endOfView);
    return { startOfView, endOfView, today, daysToShow };
}

export function getDaysBetween(start: Date, end: Date) {
    for (
        // eslint-disable-next-line no-var
        var arr = [], dt = new Date(start);
        dt <= end;
        dt.setDate(dt.getDate() + 1)
    ) {
        arr.push(new Date(dt));
    }
    return arr;
}
