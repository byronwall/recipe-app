import axios from "axios";
import cheerio from "cheerio";
import debug from "debug";

import { ParsedRecipeData, RecipeSearchData } from "./model";
import random_recipes from "./random_recipes.json";
import _ from "lodash";
import { logError } from "./errors";

const log = debug("recipe:search");

const allRecipesWeighted = _.uniqBy(
  _.shuffle(random_recipes).map((rec) => {
    return {
      ...rec,
      score: Math.log10(Math.max(1, +rec.reviewCount)) * rec.stars,
    };
  }),
  (c) => c.imageUrl
);

export function getRandomRecipes() {
  return weighted_random(allRecipesWeighted, "score", 20);
}

function weighted_random<T>(items: T[], weight_field: keyof T, count: number) {
  const cumulative_weights: number[] = [];
  let i = 0;
  for (i = 0; i < items.length; i++) {
    const curWeight = +items[i][weight_field];
    cumulative_weights[i] = curWeight + (cumulative_weights[i - 1] || 0);
  }

  const results = [];
  for (let j = 0; j < count; j++) {
    const random =
      Math.random() * cumulative_weights[cumulative_weights.length - 1];

    for (i = 0; i < cumulative_weights.length; i++) {
      if (cumulative_weights[i] > random) {
        break;
      }
    }
    results.push(items[i]);
  }

  return results;
}

export async function getRecipeDataForQuery(
  query: string
): Promise<RecipeSearchData[]> {
  // take the query and search for it
  const queryEnc = encodeURIComponent(query);
  const searchUrl = `https://www.allrecipes.com/search/results/?search=${queryEnc}`;

  log("grabbing search from:", searchUrl);
  try {
    const search = await axios.get(searchUrl, {});

    if (search.data) {
      const $ = cheerio.load(search.data);
      //<article class="fixed-recipe-card">
      const recipeCards = $(".card__recipe");

      const recipes: RecipeSearchData[] = [];

      recipeCards.each((idx, recipeElement) => {
        log("recipe card", idx);

        const name = $(
          ".card__detailsContainer .card__titleLink",
          recipeElement
        ).text();

        const url = $("a.card__titleLink", recipeElement).attr("href") ?? "";

        log("url", url);

        // check if recipe url is ok

        const urlRegex = /https:\/\/www\.allrecipes\.com\/recipe\/(\d+)/;

        const matches = url.match(urlRegex);

        if (matches === null || matches.length === 0) {
          return;
        }

        const stars = +$(".review-star-text", recipeElement)
          .text()
          .replace("Rating: ", "")
          .replace("stars", "")
          .trim();

        const reviewCount = $(".card__ratingCount", recipeElement).text();

        const imageUrl =
          $("div.lazy-image", recipeElement).attr("data-src") ?? "";

        if (url === "") {
          return;
        }

        // /html/body/div[1]/div[2]/div/div[3]/section/article[3]/div[1]/img
        // article.fixed-recipe-card .ng-isolate-scope

        const newRecipe: RecipeSearchData = {
          name,
          imageUrl,
          url,
          stars,
          reviewCount,
        };
        recipes.push(newRecipe);

        log("new recipe:", newRecipe);
      });

      return recipes;
    }
  } catch (error) {
    logError(error, "**** error on search");
    return [];
  }

  return [];
}

export async function getRecipeDataForSingleUrl(
  url: string
): Promise<ParsedRecipeData | undefined> {
  // take the query and search for it

  log("grabbing recipe from:", url);
  try {
    const search = await axios.get(url, {});

    if (search.data) {
      const $ = cheerio.load(search.data);
      //<article class="fixed-recipe-card">

      // ingredients
      // ul.ingredients-section

      const ingredients = $("ul.ingredients-section li")
        .find("span.ingredients-item-name")
        .map((i, c) => $(c).text())
        .get();

      const steps = $("ul.instructions-section li")
        .find("div.section-body")
        .map((i, c) => $(c).text())
        .get();

      // process the meta details which are item:value pairs

      const metaItemsObj: any = {};
      $("div.recipe-meta-item").each((i, el) => {
        const key = $("div.recipe-meta-item-header", el)
          .text()
          .toLowerCase()
          .trim();
        const value = $("div.recipe-meta-item-body", el).text();

        metaItemsObj[key] = value;
      });

      return {
        ingredients,
        steps,
        cookTime: metaItemsObj["cook:"] ?? "",
        prepTime: metaItemsObj["prep:"] ?? "",
        totalTime: metaItemsObj["total:"] ?? "",
        servings: metaItemsObj["servings:"] ?? "",
      };
    }
  } catch (error) {
    logError(error, "**** error on search");
  }

  return undefined;
}
