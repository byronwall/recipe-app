import express from "express";
import { existsSync, readFileSync, writeFileSync } from "fs";
import * as path from "path";

import { Ingredient, Recipe, SavedDb } from "./model";

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

      const existingRecipeIndex = db.recipes.findIndex(
        (c) => c.id === recipe.id
      );

      // add any new ingredients to the list
      recipe.ingredientGroups.forEach((grp) =>
        grp.ingredients.forEach((ingredToCheck) => {
          const matchingNew = newIngredients.find(
            (c) => c.id === ingredToCheck.ingredientId
          );

          if (matchingNew) {
            addIngredientWithNewId(matchingNew);

            ingredToCheck.ingredientId = matchingNew.id;
          }
        })
      );

      if (existingRecipeIndex === -1) {
        /// need to create

        recipe.id = idRecipe++;
        db.recipes.push(recipe);
      } else {
        // replace the entry

        db.recipes[existingRecipeIndex] = recipe;
      }

      // check if any new ingredients

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

    const indexPaths = ["/", "/recipe"];
    app.get(indexPaths, function (req, res) {
      res.sendFile(path.join(staticPath, "index.html"));
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
