import { Alignment, H5, Navbar, NavbarGroup } from "@blueprintjs/core";
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
                        <H5>recipes</H5>
                    </NavLink>

                    <NavLink
                        to="/ingredients"
                        className="bp3-button bp3-minimal  header-link"
                        activeClassName="bp3-active bp3-intent-primary"
                    >
                        <H5>ingredients</H5>
                    </NavLink>
                    <NavLink
                        to="/plan"
                        className="bp3-button bp3-minimal  header-link"
                        activeClassName="bp3-active bp3-intent-primary"
                    >
                        <H5>plan</H5>
                    </NavLink>
                    <NavLink
                        to="/list"
                        className="bp3-button bp3-minimal  header-link"
                        activeClassName="bp3-active bp3-intent-primary"
                    >
                        <H5>list</H5>
                    </NavLink>
                    <NavLink
                        to="/browse"
                        className="bp3-button bp3-minimal  header-link"
                        activeClassName="bp3-active bp3-intent-primary"
                    >
                        <H5>browse</H5>
                    </NavLink>
                </NavbarGroup>
            </Navbar>
        );
    }
}
