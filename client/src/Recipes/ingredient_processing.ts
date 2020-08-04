import FuzzySet from "fuzzyset";
import _ from "lodash";

import { GLOBAL_DATA_LAYER } from "..";
import { IngredientAmount, Recipe, Ingredient } from "../models";
import {
    SuggestedIngredient,
    IngredientHash,
} from "../Ingredients/SuggestedIngredients";

const possibleUnits = [
    "cup",
    "teaspoon",
    "tablespoon",
    "tsp",
    "tbsp",
    "pound",
    "can",
    "oz can",
    "pinch",
];
const fuzzySet = FuzzySet(possibleUnits, false, 3, 5);

export interface NewIngAmt {
    newName: string | undefined;
    newIng: IngredientAmount;
}

export function guessIngredientParts(
    input: IngredientAmount
): NewIngAmt | undefined {
    const newIngredient = _.cloneDeep(input);

    const result: NewIngAmt = {
        newIng: newIngredient,
        newName: undefined,
    };

    // do some basic processing to guess how to process the text to pieces

    // amount is based on the first numbers(s)

    const numberRegex = /(\d+(?:(?: \d+)*[\/.]\d+)?)/;

    const allIngredients = GLOBAL_DATA_LAYER.state.ingredients;

    const ingredient = allIngredients.find(
        (c) => c.id === newIngredient.ingredientId
    );

    if (ingredient === undefined) {
        return undefined;
    }

    const match = ingredient.name.match(numberRegex);
    // console.log("number test", ingredient.name, match);
    if (match) {
        newIngredient.amount = match[0];
    }

    // remove the number and fuzzy search for a unit
    const newName = ingredient.name
        .replace(numberRegex, "")
        .trim()
        .toLowerCase();

    const unitSearch = (fuzzySet.get as any)(newName, null, 0.1) ?? [];

    if (unitSearch.length) {
        newIngredient.unit = unitSearch[0][1];
    }

    // console.log("new name", newName, unitSearch);

    // now remove the unit from the name

    const newNameWithoutUnit = newName.replace(newIngredient.unit, "").trim();

    // console.log("ingred search", newNameWithoutUnit);

    // TODO: create a second fuzzy set of known ingredients with good names -- search those

    // unit will be based on a lookup from common units
    // will need to build this up over time
    // once built -- will attempt to match on existing ingredient units

    // modifier will be guessed after matching other text to know ingredients?

    // console.log("final ingredient", newIngredient);

    const fuzzyIngred = GLOBAL_DATA_LAYER.state.fuzzyIngredientNames;
    const nameSearch =
        (fuzzyIngred.get as any)(newNameWithoutUnit, null, 0.15) ?? [];

    if (nameSearch.length) {
        console.log("name search", newNameWithoutUnit, nameSearch);
        const hit = nameSearch[0][1] as string;
        const ingredId = +hit.split("|||")[1];

        newIngredient.ingredientId = ingredId;
    } else {
        result.newName = newNameWithoutUnit;
    }
    return result;
}

export function getSuggestionsFromLists(
    recipes: Recipe[],
    ingredients: Ingredient[],
    searchText: string
) {
    const ingredientHash: IngredientHash = {};

    recipes.forEach((r) => {
        r.ingredientGroups.forEach((g) => {
            g.ingredients.forEach((i) => {
                if (ingredientHash[i.ingredientId] === undefined) {
                    ingredientHash[i.ingredientId] = i;
                } else {
                    ingredientHash[i.ingredientId] = null;
                }
            });
        });
    });

    const suggestions = _.values(ingredientHash)
        .filter((c) => c !== null)

        .map((c) => c as IngredientAmount)
        .reduce<SuggestedIngredient[]>((acc, c) => {
            const ingred = ingredients.find((d) => d.id === c?.ingredientId);

            if (acc.length > 30 || ingred === undefined) {
                return acc;
            }

            const doesMatchSearch =
                searchText === "" ||
                ingred?.name.toUpperCase().indexOf(searchText) > -1;

            if (!doesMatchSearch) {
                return acc;
            }

            const newIng = guessIngredientParts(c);
            if (newIng === undefined || ingred.isGoodName) {
                return acc;
            }

            const newSugg: SuggestedIngredient = {
                originalIngredient: ingred,
                suggestions: newIng,
                matchingIngred:
                    newIng.newName === undefined
                        ? ingredients.find(
                              (c) => c.id === newIng.newIng.ingredientId
                          )
                        : undefined,
            };

            acc.push(newSugg);

            return acc;
        }, [])
        .filter((c) => c !== undefined)
        .map((c) => c as SuggestedIngredient);
    return suggestions;
}
