import React from "react";
import { H4, Button, Checkbox } from "@blueprintjs/core";
import { ShoppingListItem } from "../models";
import { GLOBAL_DATA_LAYER } from "..";
import { handleBooleanChange } from "../helpers";
import _ from "lodash";

interface ShoppingListProps {
    shoppingList: ShoppingListItem[];
}
interface ShoppingListState {}

export class ShoppingList extends React.Component<
    ShoppingListProps,
    ShoppingListState
> {
    constructor(props: ShoppingListProps) {
        super(props);

        this.state = {};
    }

    componentDidMount() {}

    componentDidUpdate(
        prevProps: ShoppingListProps,
        prevState: ShoppingListState
    ) {}

    handleItemUpdate<K extends keyof ShoppingListItem>(
        id: number,
        key: K,
        value: ShoppingListItem[K]
    ) {
        const matchingItem = this.props.shoppingList.find((c) => c.id === id);

        if (matchingItem === undefined) {
            console.error("could not find ID?");
            return;
        }

        const newItem = _.cloneDeep(matchingItem);
        newItem[key] = value;

        GLOBAL_DATA_LAYER.updateShoppingListItem(newItem);
    }

    render() {
        return (
            <div>
                <p>ShoppingList</p>

                <H4>add a new item</H4>

                <p>some form for adding a loose item</p>

                <H4>current list</H4>

                <Button
                    text="delete all"
                    intent="danger"
                    onClick={() => this.clearAllItems()}
                />

                <Button
                    text="delete bought"
                    intent="warning"
                    onClick={() => this.clearBoughtItems()}
                />

                {this.props.shoppingList.map((item, index) => {
                    const ing = GLOBAL_DATA_LAYER.getIngredient(
                        item.ingredientAmount.ingredientId
                    );
                    return (
                        <div key={index} className="flex">
                            <Checkbox
                                checked={item.isBought}
                                onChange={handleBooleanChange((isBought) =>
                                    this.handleItemUpdate(
                                        item.id,
                                        "isBought",
                                        isBought
                                    )
                                )}
                            />

                            {ing?.name}
                        </div>
                    );
                })}
            </div>
        );
    }
    clearBoughtItems() {
        const shouldDelete = window.confirm(
            "Sure you want to remove all bought items?"
        );

        if (!shouldDelete) {
            return;
        }

        const idsBoughtItems = this.props.shoppingList
            .filter((c) => c.isBought)
            .map((c) => c.id);

        console.log("bought IDs", idsBoughtItems);

        GLOBAL_DATA_LAYER.deleteShoppingListItems(idsBoughtItems);
    }
    clearAllItems() {
        const shouldDelete = window.confirm(
            "Sure you want to remove all items?"
        );

        if (!shouldDelete) {
            return;
        }

        const idsAllItems = this.props.shoppingList.map((c) => c.id);

        GLOBAL_DATA_LAYER.deleteShoppingListItems(idsAllItems);
    }
}
