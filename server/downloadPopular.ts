import fs from "fs";

import { RecipeSearchData } from "./src/model";
import { getRecipeDataForQuery } from "./src/recipe_search";

const searchTerms = [
  "Durian",
  "Tortas",
  "Spring Rolls",
  "Frozen Yogurt",
  "Brie de Meaux",
  "Miso Soup",
  "Sarma",
  "Pizza Margherita",
  "Pizza Napoletana",
  "Satay",
  "Banchan",
  "Éclair",
  "Nougat",
  "Grilled Cheese",
  "Kombu",
  "Pavlova",
  "Parfait",
  "Nori",
  "Börek",
  "Churros",
  "Guacamole",
  "Mooncake",
  "Fondue",
  "Tamal",
  "Bulgogi",
  "Dashi",
  "Penne",
  "Macaroni",
  "Fish and Chips",
  "Pad Thai",
  "Churrasco",
  "Quesadilla",
  "Parmigiano Reggiano",
  "Chutney",
  "Ceviche",
  "Fajitas",
  "Baguette",
  "Chocolate Chip Cookie",
  "Bibimbap",
  "Naan",
  "Miso",
  "Afternoon Tea",
  "Tonkatsu",
  "Nachos",
  "Wasabi",
  "Sundae",
  "Hummus",
  "Pho",
  "Mac and Cheese",
  "Burrito",
  "Fried Chicken",
  "Pasta carbonara",
  "Shabu-shabu",
  "Biryani",
  "Wonton",
  "Soba",
  "Pretzel",
  "Kimchi",
  "Quiche",
  "Fudge",
  "Onigiri",
  "Baozi",
  "Tiramisù",
  "Ricotta",
  "Lasagna",
  "Tagliatelle al ragù alla Bolognese",
  "Gyoza",
  "Feta",
  "Risotto",
  "Milkshake",
  "Roti",
  "Doughnut",
  "Macarons",
  "Yakitori",
  "Pommes frites",
  "Wagashi",
  "Cheddar",
  "Barbecue",
  "Cheeseburger",
  "Mozzarella",
  "Paella",
  "Mousse",
  "Brownies",
  "Udon",
  "Jiaozi",
  "Spaghetti",
  "Dim sum",
  "Sashimi",
  "Yakiniku",
  "Tortilla",
];

async function downloadAll(searches: string[]) {
  let allRecipes: RecipeSearchData[] = [];

  for (const search of searches) {
    const recipes = await getRecipeDataForQuery(search);

    console.log("recipes found", new Date(), search, recipes.length);

    allRecipes = allRecipes.concat(recipes);
    fs.writeFileSync("random_recipes.json", JSON.stringify(allRecipes));

    await sleep(2000);
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

downloadAll(searchTerms);

// save all of those to disk
