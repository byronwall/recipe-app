import express from "express";
import { readFileSync, writeFileSync, existsSync } from "fs";
import * as path from "path";

import { Ingredient, SavedDb } from "./model";

let db: SavedDb = { recipes: [], ingredients: [] };
const dbPath = "db.json";

let idIngredient = 1;

function reloadDatabase() {
  if (!existsSync(dbPath)) {
    saveDatabase();
  }
  db = JSON.parse(readFileSync(dbPath, "utf8")) as SavedDb;

  idIngredient = (Math.max(...db.ingredients.map((c) => c.id)) || 0) + 1;
}

function saveDatabase() {
  const data = JSON.stringify(db);
  writeFileSync(dbPath, data);
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
      res.json({ result: true });

      // find that type...
    });

    app.post("/api/add_ingredient", (req: any, res: any) => {
      console.log(new Date(), "add ingredient");

      const ingred = req.body as Ingredient;

      ingred.id = idIngredient++;

      db.ingredients.push(ingred);
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
