import { Alignment, H3, Navbar, NavbarGroup } from "@blueprintjs/core";
import React from "react";
import { NavLink } from "react-router-dom";

export class Navigation extends React.Component {
    render() {
        return (
            <Navbar>
                <NavbarGroup align={Alignment.LEFT}>
                    <NavLink
                        to="/recipes"
                        className="bp3-button bp3-minimal  header-link"
                        activeClassName="bp3-active bp3-intent-primary"
                    >
                        <H3>recipes</H3>
                    </NavLink>

                    <NavLink
                        to="/ingredients"
                        className="bp3-button bp3-minimal  header-link"
                        activeClassName="bp3-active bp3-intent-primary"
                    >
                        <H3>ingredients</H3>
                    </NavLink>
                    <NavLink
                        to="/plan"
                        className="bp3-button bp3-minimal  header-link"
                        activeClassName="bp3-active bp3-intent-primary"
                    >
                        <H3>plan</H3>
                    </NavLink>
                    <NavLink
                        to="/list"
                        className="bp3-button bp3-minimal  header-link"
                        activeClassName="bp3-active bp3-intent-primary"
                    >
                        <H3>list</H3>
                    </NavLink>
                </NavbarGroup>
            </Navbar>
        );
    }
}
