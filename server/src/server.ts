import * as bodyParser from "body-parser";
import express from "express";
import * as path from "path";

export class Server {
  static start() {
    const app = express();

    app.use(bodyParser.json());

    const staticPath = path.join(__dirname, "static");
    // this assumes that the app is running in server/build

    console.log("static path", staticPath);

    app.use(express.static(staticPath));

    app.get("/api/receipes", (req: any, res: any) => {
      // return a set of 30 stories with the title, comment count, and URL
      // add those to the DB and set some flag saying that they need full details loaded
      // load the first layer and note that more could be loaded
      // store those top stories for some period of time

      console.log(new Date(), "recipes");
      res.json({ result: true });

      // find that type...
    });

    var port = process.env.PORT || 3001;
    app.listen(port);

    // set up the auto download

    console.log("server is running on port: " + port);
  }
}
