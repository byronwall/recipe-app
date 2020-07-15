import "./index.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";

import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "unstated";

import { App } from "./App";
import { DataLayer } from "./DataLayer";
import * as serviceWorker from "./serviceWorker";

export const GLOBAL_DATA_LAYER = new DataLayer();

ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter>
            <Provider inject={[GLOBAL_DATA_LAYER]}>
                <App />
            </Provider>
        </BrowserRouter>
    </React.StrictMode>,
    document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
