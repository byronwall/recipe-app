import express from "express";
import { existsSync, readFileSync, writeFileSync } from "fs";
import * as path from "path";

import {
  Ingredient,
  Recipe,
  SavedDb,
  PlannedMeal,
  API_RecipeIngredParam,
  API_RecipeParam,
  API_IngredParam,
  ShoppingListItem,
  API_ShoppingAdd,
  API_ShoppingDelete,
  API_ShoppingUpdate,
  API_MealPlanUpdate,
  API_ShoppingRemoveRecipe,
} from "./model";
import _ from "lodash";

let db: SavedDb = {
  recipes: [],
  ingredients: [],
  plannedMeals: [],
  shoppingList: [],
};
const dbPath = "db.json";

let idIngredient = 1;
let idRecipe = 1;

function reloadDatabase() {
  if (!existsSync(dbPath)) {
    saveDatabase();
  }
  db = JSON.parse(readFileSync(dbPath, "utf8")) as SavedDb;

  if (!(("plannedMeals" in db) as any)) {
    db.plannedMeals = [];
  }

  // ensure old data has the shopping list
  if (!(("shoppingList" in db) as any)) {
    db.shoppingList = [];
  }

  // clean up bad whitespace

  db.ingredients.forEach((ingred) => {
    ingred.name = ingred.name.replace(/\s+/g, " ");
  });

  // remove bad ingredients

  removeMissingIngredientsFromDb();

  idIngredient = (Math.max(...db.ingredients.map((c) => c.id)) || 1) + 1;
  idRecipe = (Math.max(...db.recipes.map((c) => c.id)) || 1) + 1;
}

function removeMissingIngredientsFromDb() {
  const goodIngIds: { [key: number]: true } = {};

  db.recipes.forEach((recipe) => {
    recipe.ingredientGroups.forEach((grp) => {
      grp.ingredients.forEach((ing) => {
        goodIngIds[ing.ingredientId] = true;
      });
    });
  });

  db.ingredients = db.ingredients.filter((c) => {
    const wasFound = goodIngIds[c.id];
    if (!wasFound) {
      console.log("missing ingred", c);
    }
    return wasFound;
  });
}

function saveDatabase() {
  removeMissingIngredientsFromDb();
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

    app.post("/api/update_recipe_ingredient", (req: any, res: any) => {
      const postData = req.body as API_RecipeIngredParam;
      console.log(new Date(), "update recipe and ingredient", postData);

      const recipeIndex = db.recipes.findIndex(
        (c) => c.id === postData.recipe.id
      );

      const ingredientIndex = db.ingredients.findIndex(
        (c) => c.id === postData.ingredient.id
      );

      if (recipeIndex > -1 && ingredientIndex > -1) {
        // send back the current database

        // do some updates

        // find the recipe -- update it

        // find the ingredient -- update it
        db.ingredients[ingredientIndex] = postData.ingredient;
        db.recipes[recipeIndex] = postData.recipe;

        saveDatabase();
      }

      res.json({ ...db });
    });

    app.post("/api/update_ingredient", (req: any, res: any) => {
      const postData = req.body as API_IngredParam;
      console.log(new Date(), "update recipe and ingredient", postData);

      const ingredientIndex = db.ingredients.findIndex(
        (c) => c.id === postData.ingredient.id
      );

      if (ingredientIndex > -1) {
        db.ingredients[ingredientIndex] = postData.ingredient;

        saveDatabase();
      }

      res.json({ ...db });
    });

    app.post("/api/update_recipe", (req: any, res: any) => {
      const postData = req.body as API_RecipeParam;
      console.log(new Date(), "update recipe and ingredient", postData);

      const recipeIndex = db.recipes.findIndex(
        (c) => c.id === postData.recipe.id
      );

      if (recipeIndex > -1) {
        db.recipes[recipeIndex] = postData.recipe;
        saveDatabase();
      }

      res.json({ ...db });
    });

    app.post("/api/add_ingredient", (req: any, res: any) => {
      console.log(new Date(), "add ingredient");

      const ingredient = req.body as Ingredient;

      addIngredientWithNewId(ingredient);
      saveDatabase();

      res.json({ ...db });

      // find that type...
    });

    app.post("/api/add_shopping", (req: any, res: any) => {
      console.log(new Date(), "add shopping items");

      const list = req.body as API_ShoppingAdd;

      db.shoppingList = db.shoppingList.concat(list.items);
      saveDatabase();

      res.json({ ...db });

      // find that type...
    });

    app.post("/api/delete_shopping", (req: any, res: any) => {
      console.log(new Date(), "delete shopping items");

      const list = req.body as API_ShoppingDelete;

      _.remove(db.shoppingList, (c) => _.includes(list.ids, c.id));
      saveDatabase();

      res.json({ ...db });

      // find that type...
    });

    app.post("/api/update_shopping", (req: any, res: any) => {
      console.log(new Date(), "update shopping items");

      const postData = req.body as API_ShoppingUpdate;

      let didMakeChange = false;
      postData.item.forEach((item) => {
        const index = db.shoppingList.findIndex((c) => c.id === item.id);

        if (index > -1) {
          db.shoppingList[index] = item;
          didMakeChange = true;
        }
      });

      if (didMakeChange) {
        saveDatabase();
      }

      res.json({ ...db });

      // find that type...
    });
    app.post("/api/shopping_remove_recipe", (req: any, res: any) => {
      console.log(new Date(), "remove shopping recipe");

      const postData = req.body as API_ShoppingRemoveRecipe;

      // remove recipe based on id
      db.shoppingList = db.shoppingList.filter(
        (c) => c.recipeId !== postData.recipeId
      );
      saveDatabase();

      res.json({ ...db });

      // find that type...
    });

    app.post("/api/add_meal", (req: any, res: any) => {
      console.log(new Date(), "add meal");

      const meal = req.body.meal as PlannedMeal;

      db.plannedMeals.push(meal);
      saveDatabase();

      res.json({ ...db });

      // find that type...
    });

    app.post("/api/update_meals", (req: any, res: any) => {
      console.log(new Date(), "update meals");

      const postData = req.body as API_MealPlanUpdate;

      let didMakeUpdate = false;

      postData.meals.forEach((meal) => {
        const mealIndex = db.plannedMeals.findIndex((c) => c.id === meal.id);
        if (mealIndex === -1) {
          return;
        }
        db.plannedMeals[mealIndex] = meal;
        didMakeUpdate = true;
      });

      if (didMakeUpdate) {
        saveDatabase();
      }

      res.json({ ...db });

      // find that type...
    });

    app.post("/api/delete_meal", (req: any, res: any) => {
      console.log(new Date(), "delete meal");

      const meal = req.body.meal as PlannedMeal;

      db.plannedMeals = db.plannedMeals.filter((c) => c.id !== meal.id);
      saveDatabase();

      res.json({ ...db });

      // find that type...
    });

    app.post("/api/delete_recipe", (req: any, res: any) => {
      console.log(new Date(), "delete meal");

      const id = req.body.id as number;

      db.recipes = db.recipes.filter((c) => c.id !== id);
      saveDatabase();

      res.json({ ...db });

      // find that type...
    });

    const indexPaths = ["/", "/recipe/:id", "/plan", "/list"];
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
