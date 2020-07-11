import React from "react";
import { Navigation } from "./Navigation";

export class App extends React.Component {
  render() {
    return (
      <div style={{ width: 960, margin: "auto", marginTop: 10 }}>
        <Navigation />
      </div>
    );
  }
}
