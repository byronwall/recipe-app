import express from "express";
import { readFileSync, writeFileSync, existsSync } from "fs";
import * as path from "path";

import { Ingredient, SavedDb, Recipe } from "./model";

let db: SavedDb = { recipes: [], ingredients: [] };
const dbPath = "db.json";

let idIngredient = 1;
let idRecipe = 1;

function reloadDatabase() {
  if (!existsSync(dbPath)) {
    saveDatabase();
  }
  db = JSON.parse(readFileSync(dbPath, "utf8")) as SavedDb;

  idIngredient = (Math.max(...db.ingredients.map((c) => c.id)) || 1) + 1;
  idRecipe = (Math.max(...db.recipes.map((c) => c.id)) || 1) + 1;
}

function saveDatabase() {
  const data = JSON.stringify(db);
  writeFileSync(dbPath, data);
}

interface NewRecipeReq {
  recipe: Recipe;
  newIngredients: Ingredient[];
}

export class Server {
  static start() {
    const app = express();

    app.use(express.json());

    reloadDatabase();

    const staticPath = path.join(__dirname, "static");
    // this assumes that the app is running in server/build

    console.log("static path", staticPath);

    app.use(express.static(staticPath));

    app.get("/api/db", (req: any, res: any) => {
      console.log(new Date(), "db");
      res.json({ ...db });

      // find that type...
    });

    app.post("/api/add_recipe", (req: any, res: any) => {
      console.log(new Date(), "add recipe");

      const { recipe, newIngredients } = req.body as NewRecipeReq;

      // add any new ingredients to the list
      recipe.ingredients.forEach((ingredToCheck) => {
        const matchingNew = newIngredients.find(
          (c) => c.id === ingredToCheck.ingredientId
        );

        if (matchingNew) {
          addIngredientWithNewId(matchingNew);
        }
      });

      recipe.id = idRecipe++;

      // check if any new ingredients

      db.recipes.push(recipe);
      saveDatabase();

      res.json({ ...db });

      // find that type...
    });

    app.post("/api/add_ingredient", (req: any, res: any) => {
      console.log(new Date(), "add ingredient");

      const ingredient = req.body as Ingredient;

      addIngredientWithNewId(ingredient);
      saveDatabase();

      res.json({ ...db });

      // find that type...
    });

    var port = process.env.PORT || 3001;
    app.listen(port);

    // set up the auto download

    console.log("server is running on port: " + port);
  }
}
function addIngredientWithNewId(ingredient: Ingredient) {
  ingredient.id = idIngredient++;

  db.ingredients.push(ingredient);
}
