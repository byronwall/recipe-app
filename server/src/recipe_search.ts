import axios from "axios";
import cheerio from "cheerio";
import debug from "debug";

import { RecipeSearchData } from "./model";

const log = debug("recipe:search");

export async function getRecipeDataForQuery(
  query: string
): Promise<RecipeSearchData[]> {
  // take the query and search for it
  const queryEnc = encodeURIComponent(query);
  const searchUrl = `https://www.allrecipes.com/search/results/?wt=${queryEnc}&sort=p`;

  log("grabbing search from:", searchUrl);
  try {
    const search = await axios.get(searchUrl, {});

    if (search.data) {
      const $ = cheerio.load(search.data);
      //<article class="fixed-recipe-card">
      const recipeCards = $("article");

      const recipes: RecipeSearchData[] = [];

      recipeCards.each((idx, c) => {
        log("recipe card", idx);

        const name = $("span.fixed-recipe-card__title-link", c).text();
        const url = $("a.fixed-recipe-card__title-link", c).attr("href") ?? "";

        log("url", url);

        // check if recipe url is ok

        const urlRegex = /https:\/\/www\.allrecipes\.com\/recipe\/(\d+)/;

        const matches = url.match(urlRegex);

        log("regec match", matches);

        if (matches === null || matches.length === 0) {
          return;
        }

        // TODO: grab the stars and ratings
        // TODO: parse the recipe on next step

        const imageUrl =
          $("div.grid-card-image-container img", c).attr("data-original-src") ??
          "";

        if (url === "") {
          return;
        }

        // /html/body/div[1]/div[2]/div/div[3]/section/article[3]/div[1]/img
        // article.fixed-recipe-card .ng-isolate-scope

        const newRecipe = {
          name,
          imageUrl,
          url,
        };
        recipes.push(newRecipe);

        log("new recipe:", newRecipe);
      });

      return recipes;
    }
  } catch (error) {
    console.log("**** error on search");
    console.log(error.response.status);
    console.log(error.response.statusText);
    console.log(error.response.data);

    return [];
  }

  return [];
}
