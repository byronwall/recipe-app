import FuzzySet from "fuzzyset";
import _ from "lodash";

import { GLOBAL_DATA_LAYER } from "..";
import { IngredientAmount } from "../models";

const possibleUnits = ["cup", "teaspoon", "tablespoon", "tsp", "tbsp", "pound"];
const fuzzySet = FuzzySet(possibleUnits, false, 3);

export interface NewIngAmt {
    newName: string;
    newIng: IngredientAmount;
}

export function guessIngredientParts(
    input: IngredientAmount
): NewIngAmt | undefined {
    const newIngredient = _.cloneDeep(input);

    const result: NewIngAmt = {
        newIng: newIngredient,
        newName: "",
    };

    // do some basic processing to guess how to process the text to pieces

    // amount is based on the first numbers(s)

    const numberRegex = /^(\d+(?:(?: \d+)*[\/.]\d+)?)/;

    const allIngredients = GLOBAL_DATA_LAYER.state.ingredients;

    const ingredient = allIngredients.find(
        (c) => c.id === newIngredient.ingredientId
    );

    if (ingredient === undefined) {
        return undefined;
    }

    const match = ingredient.name.match(numberRegex);
    console.log("number test", ingredient.name, match);
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

    console.log("new name", newName, unitSearch);

    // now remove the unit from the name

    const newNameWithoutUnit = newName.replace(newIngredient.unit, "").trim();

    console.log("ingred search", newNameWithoutUnit);

    // TODO: create a second fuzzy set of known ingredients with good names -- search those

    // unit will be based on a lookup from common units
    // will need to build this up over time
    // once built -- will attempt to match on existing ingredient units

    // modifier will be guessed after matching other text to know ingredients?

    console.log("final ingredient", newIngredient);

    result.newName = newNameWithoutUnit;
    return result;
}
