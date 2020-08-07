import {
    Alignment,
    Navbar,
    NavbarDivider,
    NavbarGroup,
    NavbarHeading,
} from "@blueprintjs/core";
import { faCarrot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Link, NavLink } from "react-router-dom";

export class Navigation extends React.Component {
    render() {
        return (
            <Navbar>
                <NavbarGroup align={Alignment.LEFT}>
                    <NavbarHeading>
                        <Link to="/">
                            <FontAwesomeIcon icon={faCarrot} size="2x" />
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
                    <NavLink
                        to="/plan"
                        className="bp3-button bp3-minimal  header-link"
                        activeClassName="bp3-active bp3-intent-primary"
                    >
                        plan
                    </NavLink>
                    <NavLink
                        to="/list"
                        className="bp3-button bp3-minimal  header-link"
                        activeClassName="bp3-active bp3-intent-primary"
                    >
                        list
                    </NavLink>
                </NavbarGroup>
            </Navbar>
        );
    }
}
