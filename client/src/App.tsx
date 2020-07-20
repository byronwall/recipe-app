import { Card } from "@blueprintjs/core";
import React from "react";
import { Route, Switch } from "react-router-dom";
import { Subscribe } from "unstated";

import { GLOBAL_DATA_LAYER } from ".";
import { DataLayer } from "./DataLayer";
import { HomePage } from "./HomePage";
import { Ingredients } from "./Ingredients";
import { MealPlan } from "./MealPlan/MealPlan";
import { Navigation } from "./Navigation";
import { RecipeList } from "./Recipes/RecipeList";
import { RecipeViewer } from "./Recipes/RecipeViewer";

export class App extends React.Component {
    render() {
        return (
            <Subscribe to={[DataLayer]}>
                {(data: DataLayer) => (
                    <div
                        style={{
                            maxWidth: 960,
                            margin: "auto",
                            marginTop: 10,
                            paddingLeft: 10,
                            paddingRight: 10,
                        }}
                    >
                        <Navigation />

                        <Card style={{ marginTop: 10 }}>
                            <Switch>
                                <Route path="/recipes">
                                    <RecipeList />
                                </Route>

                                <Route
                                    path="/recipe/:id"
                                    render={(props) => {
                                        const id = +props.match.params["id"];
                                        const recipe = data.state.recipes.find(
                                            (c) => c.id === id
                                        );
                                        return <RecipeViewer recipe={recipe} />;
                                    }}
                                ></Route>

                                <Route path="/ingredients">
                                    <Ingredients
                                        ingredients={data.state.ingredients}
                                        onSaveNewIngredient={(newIngredient) =>
                                            GLOBAL_DATA_LAYER.addIngredient(
                                                newIngredient
                                            )
                                        }
                                    />
                                </Route>

                                <Route path="/plan">
                                    <MealPlan meals={data.state.plannedMeals} />
                                </Route>

                                <Route path="/" exact>
                                    <HomePage />
                                </Route>
                            </Switch>
                        </Card>
                    </div>
                )}
            </Subscribe>
        );
    }
}
