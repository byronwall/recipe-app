import { Button, H3, H4, HTMLTable } from "@blueprintjs/core";
import React from "react";
import { Link } from "react-router-dom";
import { Subscribe } from "unstated";

import { GLOBAL_DATA_LAYER } from "..";
import { DataLayer } from "../DataLayer";
import {
    createDefaultRecipe,
    getNewId,
    Ingredient,
    IngredientGroup,
    Recipe,
} from "../models";
import old_recipes from "../recipes.json";
import { NewRecipe } from "./NewRecipe";

interface RecipeListProps {}
interface RecipeListState {
    showNewRecipeForm: boolean;

    oldRecipeText: string;
}

export class RecipeList extends React.Component<
    RecipeListProps,
    RecipeListState
> {
    constructor(props: RecipeListProps) {
        super(props);

        this.state = { showNewRecipeForm: false, oldRecipeText: "" };
    }

    componentDidMount() {}

    componentDidUpdate(
        prevProps: RecipeListProps,
        prevState: RecipeListState
    ) {}

    saveNewRecipe(newRecipe: Recipe) {
        GLOBAL_DATA_LAYER.saveNewRecipe(newRecipe);
    }

    render() {
        return (
            <Subscribe to={[DataLayer]}>
                {(data: DataLayer) => (
                    <div>
                        <p>RecipeList</p>

                        <div>
                            <Button
                                text="add new recipe"
                                icon="plus"
                                intent="primary"
                                onClick={() =>
                                    this.setState({ showNewRecipeForm: true })
                                }
                            />

                            {this.state.showNewRecipeForm && (
                                <NewRecipe
                                    onSaveRecipe={(newRecipe) =>
                                        this.saveNewRecipe(newRecipe)
                                    }
                                />
                            )}

                            <H3>recipe list</H3>

                            <HTMLTable striped condensed bordered>
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>name</th>
                                        <th>actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {data.state.recipes.map((recipe) => (
                                        <tr key={recipe.id}>
                                            <td>{recipe.id}</td>
                                            <td>
                                                <Link
                                                    to={"/recipe/" + recipe.id}
                                                >
                                                    <div>{recipe.name}</div>
                                                </Link>
                                            </td>
                                            <td>
                                                <Button
                                                    icon="cross"
                                                    intent="danger"
                                                    onClick={() =>
                                                        this.removeRecipe(
                                                            recipe.id
                                                        )
                                                    }
                                                    minimal
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </HTMLTable>
                        </div>
                    </div>
                )}
            </Subscribe>
        );
    }
    removeRecipe(id: number) {
        GLOBAL_DATA_LAYER.deleteRecipe(id);
    }

    convertAllOldRecipes() {
        old_recipes.recipes.forEach((recipe, index) => {
            if (index > 0) {
                // return;
            }
            console.log(recipe);

            const content = recipe.content;

            const parser = new DOMParser();
            const doc = parser.parseFromString(content, "text/html");

            const new_recipe: Recipe = createDefaultRecipe();

            new_recipe.name = recipe.url.title;

            let grpIdx = 0;

            const groups = doc.querySelectorAll(".dirgroups > li");
            groups.forEach((group) => {
                let step_group = new_recipe.stepGroups[grpIdx];
                if (step_group === undefined) {
                    const new_group = { steps: [], title: "" };
                    new_recipe.stepGroups[grpIdx] = new_group;

                    step_group = new_group;
                }
                const title = group.querySelector("h4")?.textContent ?? "";

                step_group.title = title;

                const items = group.querySelectorAll(".dirgroupitems li");

                console.log(group, items);

                items.forEach((item) => {
                    new_recipe.stepGroups[grpIdx].steps.push({
                        description: item.textContent ?? "",
                        duration: "",
                    });
                });

                grpIdx++;
            });

            grpIdx = 0;

            const newIngreds: Ingredient[] = [];

            const ingGroups = doc.querySelectorAll(".inggroups > li");
            ingGroups.forEach((group) => {
                let step_group = new_recipe.ingredientGroups[grpIdx];
                if (step_group === undefined) {
                    const new_group: IngredientGroup = {
                        ingredients: [],
                        title: "",
                    };
                    new_recipe.ingredientGroups[grpIdx] = new_group;

                    step_group = new_group;
                }
                const title = group.querySelector("h4")?.textContent ?? "";

                step_group.title = title;

                const items = group.querySelectorAll(".inggroupitems li");

                console.log(group, items);

                items.forEach((item) => {
                    const newIngred: Ingredient = {
                        id: getNewId() - Math.random() * 10000,
                        name: item.textContent?.trim() ?? "",
                        plu: "",
                        isGoodName: false,
                        aisle: "",
                        comments: "",
                    };

                    newIngreds.push(newIngred);

                    step_group.ingredients.push({
                        amount: 1,
                        ingredientId: newIngred.id,
                        modifier: "",
                        unit: "",
                    });
                });

                grpIdx++;
            });

            GLOBAL_DATA_LAYER.saveNewRecipe(new_recipe, newIngreds);
        });
    }
}

export function htmlToElement(html: string): DocumentFragment {
    const template = document.createElement("template");
    html = html.trim();
    template.innerHTML = html;
    return template.content;
}
