import React from "react";

import {
    Navbar,
    NavbarGroup,
    Alignment,
    NavbarHeading,
    NavbarDivider,
    Button,
    Classes,
    H3,
} from "@blueprintjs/core";

import { NavLink, Link } from "react-router-dom";

export class Navigation extends React.Component {
    render() {
        return (
            <Navbar>
                <NavbarGroup align={Alignment.LEFT}>
                    <NavbarHeading>
                        <Link
                            to="/"
                            className="bp3-button bp3-minimal  header-link"
                        >
                            <H3>wall family recipes</H3>
                        </Link>
                    </NavbarHeading>
                    <NavbarDivider />
                    <NavLink
                        to="/recipes"
                        className="bp3-button bp3-minimal  header-link"
                        activeClassName="bp3-active bp3-intent-primary"
                    >
                        recipes
                    </NavLink>

                    <NavLink
                        to="/ingredients"
                        className="bp3-button bp3-minimal  header-link"
                        activeClassName="bp3-active bp3-intent-primary"
                    >
                        ingredients
                    </NavLink>
                </NavbarGroup>
            </Navbar>
        );
    }
}
