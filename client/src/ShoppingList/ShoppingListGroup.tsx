import { H3, Icon, Switch } from "@blueprintjs/core";
import _ from "lodash";
import React from "react";
import { handleBooleanChange } from "../helpers";
import { ShoppingListItem } from "../models";
import { ShoppingList } from "./ShoppingList";
import { ShoppingListGroupItem } from "./ShoppingListGroupItem";

interface ShoppingListGroupProps {
    sectionName: string;
    groupOfItems: ShoppingListItem[];

    defaultIsCollapsed: boolean;

    handleItemUpdate: ShoppingList["handleItemUpdate"];

    handleSearchUpdate(name: string | undefined, item: ShoppingListItem): void;

    handleNewAisle(item: ShoppingListItem): void;
}
interface ShoppingListGroupState {
    isCollapsed: boolean;
}

export class ShoppingListGroup extends React.Component<
    ShoppingListGroupProps,
    ShoppingListGroupState
> {
    public constructor(props: ShoppingListGroupProps) {
        super(props);

        this.state = { isCollapsed: false };
    }

    public componentDidUpdate(prevProps: ShoppingListGroupProps) {
        const { defaultIsCollapsed } = this.props;

        const didPropCollapseChange =
            prevProps.defaultIsCollapsed !== defaultIsCollapsed;

        if (didPropCollapseChange) {
            this.setState({ isCollapsed: defaultIsCollapsed });
        }
    }

    public render() {
        const {
            sectionName,
            groupOfItems,
            handleItemUpdate,
            handleNewAisle,
        } = this.props;

        const { isCollapsed } = this.state;

        return (
            <div key={sectionName} style={{}}>
                <div style={{ gridColumn: "1/5" }}>
                    <div style={{ display: "flex", gap: 10 }}>
                        <H3>{sectionName}</H3>
                        <div style={{ display: "flex", gap: 2 }}>
                            <Switch
                                checked={isCollapsed}
                                onChange={handleBooleanChange((isCollapsed) =>
                                    this.setState({ isCollapsed })
                                )}
                            />
                            <Icon icon={isCollapsed ? "eye-off" : "eye-open"} />
                        </div>
                    </div>
                </div>

                {!isCollapsed &&
                    _.map(
                        _.groupBy(
                            groupOfItems,
                            (c) => c.ingredientAmount.ingredientId
                        ),
                        (_item, ingredientId) => {
                            // TODO: process subsequent items to combine amounts

                            // TODO: show the modifier details
                            return (
                                <ShoppingListGroupItem
                                    handleItemUpdate={handleItemUpdate}
                                    handleNewAisle={handleNewAisle}
                                    items={_item}
                                    key={ingredientId}
                                />
                            );
                        }
                    )}
            </div>
        );
    }
}
