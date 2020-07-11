import React from "react";

import {
  Navbar,
  NavbarGroup,
  Alignment,
  NavbarHeading,
  NavbarDivider,
  Button,
  Classes,
} from "@blueprintjs/core";

export class Navigation extends React.Component {
  render() {
    return (
      <Navbar>
        <NavbarGroup align={Alignment.LEFT}>
          <NavbarHeading>recipes</NavbarHeading>
          <NavbarDivider />
          <Button className={Classes.MINIMAL} icon="home" text="Home" />
          <Button className={Classes.MINIMAL} icon="document" text="Files" />
        </NavbarGroup>
      </Navbar>
    );
  }
}
