import FuzzySet from "fuzzyset";
import _ from "lodash";

import { GLOBAL_DATA_LAYER } from "..";
import { IngredientAmount, Recipe, Ingredient } from "../models";
import {
    SuggestedIngredient,
    IngredientHash,
} from "../Ingredients/SuggestedIngredients";

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

    const fuzzyUnits = GLOBAL_DATA_LAYER.state.fuzzyIngredientUnits;
    const unitSearch = (fuzzyUnits.get as any)(newName, null, 0.25) ?? [];

    if (unitSearch.length) {
        newIngredient.unit = unitSearch[0][1];
    }

    // console.log("new name", newName, unitSearch);

    // now remove the unit from the name

    const newNameWithoutUnit = strReplaceAll(
        newName,
        newIngredient.unit,
        ""
    ).trim();

    console.log("test unit removal", { newName, newNameWithoutUnit });

    // process the modifier

    const fuzzyMod = GLOBAL_DATA_LAYER.state.fuzzyIngredientMods;
    const modSearch =
        (fuzzyMod.get as any)(newNameWithoutUnit, null, 0.25) ?? [];

    if (modSearch.length) {
        newIngredient.modifier = modSearch[0][1];
    }

    // now remove the unit from the name

    let newNameWithoutMod = strReplaceAll(
        newNameWithoutUnit,
        newIngredient.modifier,
        ""
    ).trim();

    // clean up the name if possible
    if (newNameWithoutMod.endsWith(",")) {
        newNameWithoutMod = newNameWithoutMod
            .substr(0, newNameWithoutMod.length - 1)
            .trim();
    }

    // console.log("ingred search", newNameWithoutUnit);

    // TODO: create a second fuzzy set of known ingredients with good names -- search those

    // unit will be based on a lookup from common units
    // will need to build this up over time
    // once built -- will attempt to match on existing ingredient units

    // modifier will be guessed after matching other text to know ingredients?

    // console.log("final ingredient", newIngredient);

    const fuzzyIngred = GLOBAL_DATA_LAYER.state.fuzzyIngredientNames;
    const nameSearch =
        (fuzzyIngred.get as any)(newNameWithoutMod, null, 0.15) ?? [];

    if (nameSearch.length) {
        const hit = nameSearch[0][1] as string;
        const ingredId = +hit.split("|||")[1];

        newIngredient.ingredientId = ingredId;
    } else {
        result.newName = newNameWithoutMod;
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

export function strReplaceAll(
    input: string,
    strReplace: string,
    strWith: string
) {
    // See http://stackoverflow.com/a/3561711/556609
    const esc = strReplace.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const reg = new RegExp(esc, "ig");
    return input.replace(reg, strWith);
}
