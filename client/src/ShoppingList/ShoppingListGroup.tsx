import { H3 } from "@blueprintjs/core";
import _ from "lodash";
import React from "react";
import { ShoppingListItem } from "../models";
import { ShoppingListGroupItem } from "./ShoppingListGroupItem";

interface ShoppingListGroupProps {
    sectionName: string;
    groupOfItems: ShoppingListItem[];

    handleSearchUpdate(name: string | undefined, item: ShoppingListItem): void;
    handleItemUpdate<K extends keyof ShoppingListItem>(
        id: number,
        key: K,
        value: ShoppingListItem[K]
    ): void;

    handleNewAisle(item: ShoppingListItem): void;
}
interface ShoppingListGroupState {}

export class ShoppingListGroup extends React.Component<
    ShoppingListGroupProps,
    ShoppingListGroupState
> {
    constructor(props: ShoppingListGroupProps) {
        super(props);

        this.state = {};
    }

    componentDidMount() {}

    componentDidUpdate(
        prevProps: ShoppingListGroupProps,
        prevState: ShoppingListGroupState
    ) {}

    render() {
        const { sectionName, groupOfItems } = this.props;

        return (
            <div key={sectionName} style={{}}>
                <div style={{ gridColumn: "1/5" }}>
                    <H3>{sectionName}</H3>
                </div>

                {_.map(
                    _.groupBy(
                        groupOfItems,
                        (c) => c.ingredientAmount.ingredientId
                    ),
                    (_item, ingredientId) => {
                        // TODO: process subsequent items to combine amounts

                        // TODO: show the modifier details
                        return (
                            <ShoppingListGroupItem
                                handleItemUpdate={this.props.handleItemUpdate}
                                handleNewAisle={this.props.handleNewAisle}
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
