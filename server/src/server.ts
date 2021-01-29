import axios, { AxiosRequestConfig } from "axios";
import debug from "debug";

import * as dotenv from "dotenv";
import express from "express";
import { existsSync, readFileSync, writeFileSync } from "fs";
import _ from "lodash";
import * as path from "path";

import {
  API_IngredParam,
  API_KrogerSearch,
  API_MealPlanUpdate,
  API_RecipeIngredParam,
  API_RecipeParam,
  API_ShoppingAdd,
  API_ShoppingDelete,
  API_ShoppingRemoveRecipe,
  API_ShoppingUpdate,
  Ingredient,
  PlannedMeal,
  Recipe,
  SavedDb,
  KrogerAuthResponse,
  API_KrogerAddCart,
  KrogerProduct,
  RecipeSearchParams,
} from "./model";
import { getRecipeDataForQuery } from "./recipe_search";

dotenv.config();

const log = debug("recipe:server");

log("ENV", process.env);

let db: SavedDb = {
  recipes: [],
  ingredients: [],
  plannedMeals: [],
  shoppingList: [],
  userAccessToken: "",
  userRefreshToken: "",
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
      log("missing ingred", c);
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

function formUrlEncoded(x: any) {
  return Object.keys(x).reduce(
    (p, c) => p + `&${c}=${encodeURIComponent(x[c])}`,
    ""
  );
}

export class Server {
  async doOAuth(isRefresh: boolean, accessCode?: string) {
    const config = {
      client: {
        id: process.env["client_id"] ?? "",
        secret: process.env["client_secret"] ?? "",
      },
      auth: {
        tokenHost: "https://api.kroger.com/v1/connect/oauth2/token",
      },
    };

    const code = Buffer.from(
      config.client.id + ":" + config.client.secret
    ).toString("base64");

    interface KrogerAuthRequest {
      scope: string;
      grant_type: string;

      code?: string;
      refresh_token?: string;
      redirect_uri?: string;
    }

    const dataObj: KrogerAuthRequest = {
      scope: "product.compact cart.basic:write",
      grant_type: "",
    };

    if (isRefresh) {
      dataObj.grant_type = "refresh_token";
      dataObj.refresh_token = db.userRefreshToken;
    } else {
      dataObj.grant_type = "authorization_code";
      dataObj.code = accessCode;
      dataObj.redirect_uri = process.env["redirect_uri"];
    }

    const postConfig: AxiosRequestConfig = {
      method: "post",
      url: "https://api.kroger.com/v1/connect/oauth2/token",
      data: formUrlEncoded(dataObj),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${code}`,
      },
    };
    try {
      const postRes = await axios.post<KrogerAuthResponse>(
        postConfig.url ?? "",
        postConfig.data,
        postConfig
      );

      log("post res", postRes);

      if (postRes.data !== undefined) {
        db.userAccessToken = postRes.data.access_token;
        db.userRefreshToken = postRes.data.refresh_token;

        saveDatabase();

        return true;
      }
    } catch (error) {
      log("***** error happened");
      log(accessCode, isRefresh);
      console.error(error.response.status);
      console.error(error.response.statusText);
      console.error(error.response.data);
    }

    return false;
  }

  start() {
    const app = express();

    app.use(express.json());

    reloadDatabase();

    const staticPath = path.join(__dirname, "static");
    // this assumes that the app is running in server/build

    log("static path", staticPath);

    app.use(express.static(staticPath));

    app.get("/api/db", (req: any, res: any) => {
      log(new Date(), "db");
      res.json({ ...db });

      // find that type...
    });

    app.post("/api/add_recipe", (req: any, res: any) => {
      log(new Date(), "add recipe");

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
      log(new Date(), "update recipe and ingredient", postData);

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
      log(new Date(), "update recipe and ingredient", postData);

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
      log(new Date(), "update recipe and ingredient", postData);

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
      log(new Date(), "add ingredient");

      const ingredient = req.body as Ingredient;

      addIngredientWithNewId(ingredient);
      saveDatabase();

      res.json({ ...db });

      // find that type...
    });

    app.post("/api/add_shopping", (req: any, res: any) => {
      log(new Date(), "add shopping items");

      const list = req.body as API_ShoppingAdd;

      db.shoppingList = db.shoppingList.concat(list.items);
      saveDatabase();

      res.json({ ...db });

      // find that type...
    });

    app.post("/api/delete_shopping", (req: any, res: any) => {
      log(new Date(), "delete shopping items");

      const list = req.body as API_ShoppingDelete;

      _.remove(db.shoppingList, (c) => _.includes(list.ids, c.id));
      saveDatabase();

      res.json({ ...db });

      // find that type...
    });

    app.post("/api/update_shopping", (req: any, res: any) => {
      log(new Date(), "update shopping items");

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
      log(new Date(), "remove shopping recipe");

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
      log(new Date(), "add meal");

      const meal = req.body.meal as PlannedMeal;

      db.plannedMeals.push(meal);
      saveDatabase();

      res.json({ ...db });

      // find that type...
    });

    app.post("/api/update_meals", (req: any, res: any) => {
      log(new Date(), "update meals");

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
      log(new Date(), "delete meal");

      const meal = req.body.meal as PlannedMeal;

      db.plannedMeals = db.plannedMeals.filter((c) => c.id !== meal.id);
      saveDatabase();

      res.json({ ...db });

      // find that type...
    });

    app.post("/api/delete_recipe", (req: any, res: any) => {
      log(new Date(), "delete meal");

      const id = req.body.id as number;

      db.recipes = db.recipes.filter((c) => c.id !== id);
      saveDatabase();

      res.json({ ...db });

      // find that type...
    });

    app.post("/api/kroger_search", async (req: any, res: any) => {
      log(new Date(), "kroger search", req.body);

      const results = await this.doKrogerSearch(
        req.body as API_KrogerSearch,
        true
      );

      res.json(results);

      // find that type...
    });

    app.post("/api/kroger_add_cart", async (req: any, res: any) => {
      log(new Date(), "kroger add to cart", req.body);

      const postData = req.body as API_KrogerAddCart;

      const url = `https://api.kroger.com/v1/cart/add`;

      // pass the data straight through
      try {
        const addResponse = await axios.put(url, postData, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${db.userAccessToken}`,
          },
        });

        res.json({ result: true });
        return;
      } catch (error) {
        log(
          error.response.status,
          error.response.statusText,
          error.response.data,
          db.userAccessToken
        );
      }

      res.json({ result: false });

      // find that type...
    });

    interface AuthParams {
      code: string;
    }

    app.get("/auth", async (req: any, res: any) => {
      // this handles the incoming OAuth request
      log(new Date(), "kroger auth", req.query);

      const postData = req.query as AuthParams;

      // turn that code into an access token

      const code = postData.code;

      log("auth code", code);

      const didAuth = await this.doOAuth(false, code);

      if (didAuth) {
        res.redirect(req.protocol + "://" + req.get("host") + "/list");
      } else {
        res.send("error occurred during auth");
      }
    });

    app.post("/api/recipe_search", async (req: any, res: any) => {
      log("processing recipe search");

      const postData = req.body as RecipeSearchParams;

      const results = await getRecipeDataForQuery(postData.query);

      log("recipe search results", results);

      res.send(results);
    });

    const indexPaths = [
      "/",
      "/recipe/:id",
      "/plan",
      "/list",
      "/recipes",
      "/ingredients",
    ];
    app.get(indexPaths, function (req, res) {
      res.sendFile(path.join(staticPath, "index.html"));
    });

    var port = process.env.PORT || 3001;
    app.listen(port);

    // set up the auto download

    log("server is running on port: " + port);
  }

  private async doKrogerSearch(
    postData: API_KrogerSearch,
    shouldRetry: boolean
  ): Promise<KrogerProduct[]> {
    const url = encodeURI(
      `https://api.kroger.com/v1/products?filter.term=${postData.filterTerm}&filter.locationId=02100086`
    );

    try {
      const search = await axios.get<KrogerProduct[]>(url, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${db.userAccessToken}`,
        },
      });

      if (search.data) {
        log("data", search.data);
      }
      return search.data;
    } catch (error) {
      log("**** error on search");
      log(error.response.status);
      log(error.response.statusText);
      log(error.response.data);

      if (error.response.data.error === "invalid_token" && shouldRetry) {
        // attempt 1 retry after a refresh
        const isAuth = await this.doOAuth(true);

        if (isAuth) {
          return await this.doKrogerSearch(postData, false);
        }
      }

      return [];
    }
  }
}
function addIngredientWithNewId(ingredient: Ingredient) {
  ingredient.id = idIngredient++;

  db.ingredients.push(ingredient);
}
