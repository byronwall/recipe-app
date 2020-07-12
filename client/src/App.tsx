import { Card } from "@blueprintjs/core"
import React from "react"
import { Route, Switch } from "react-router-dom"
import { Subscribe } from "unstated"

import { DataLayer } from "./DataLayer"
import { HomePage } from "./HomePage"
import { Ingredients } from "./Ingredients"
import { Navigation } from "./Navigation"
import { RecipeViewer } from "./Recipes/ReceipeViewer"
import { RecipeList } from "./Recipes/RecipeList"

export class App extends React.Component {
    render() {
        return (
            <Subscribe to={[DataLayer]}>
                {(data: DataLayer) => (
                    <div style={{ width: 960, margin: "auto", marginTop: 10 }}>
                        <Navigation />

                        <Card style={{ marginTop: 10 }}>
                            <Switch>
                                <Route path="/recipes">
                                    <RecipeList />
                                </Route>

                                <Route
                                    path="/recipe/:id"
                                    render={(props) => {
                                        const id = +props.match.params["id"]
                                        const recipe = data.state.recipes.find(
                                            (c) => c.id === id
                                        )
                                        return <RecipeViewer recipe={recipe} />
                                    }}
                                ></Route>

                                <Route path="/ingredients">
                                    <Ingredients />
                                </Route>

                                <Route path="/" exact>
                                    <HomePage />
                                </Route>
                            </Switch>
                        </Card>
                    </div>
                )}
            </Subscribe>
        )
    }
}
