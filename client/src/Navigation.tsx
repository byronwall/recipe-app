import { Alignment, H5 as _H5, Navbar, NavbarGroup } from "@blueprintjs/core";
import React, { FunctionComponent } from "react";
import { NavLink } from "react-router-dom";

const H5: FunctionComponent = (props) => (
    <_H5 style={{ marginBottom: 0 }}>{props.children}</_H5>
);

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
                </NavbarGroup>
            </Navbar>
        );
    }
}
