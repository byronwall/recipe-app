import React from "react";
import { H4, Button, Checkbox, H3, H2, EditableText } from "@blueprintjs/core";
import { ShoppingListItem, Ingredient } from "../models";
import { GLOBAL_DATA_LAYER } from "..";
import { handleBooleanChange } from "../helpers";
import _ from "lodash";

interface ShoppingListProps {
    shoppingList: ShoppingListItem[];
}
interface ShoppingListState {
    liveShoppingList: ShoppingListItem[];
}

export class ShoppingList extends React.Component<
    ShoppingListProps,
    ShoppingListState
> {
    constructor(props: ShoppingListProps) {
        super(props);

        this.state = { liveShoppingList: this.props.shoppingList };
    }

    componentDidMount() {}

    componentDidUpdate(
        prevProps: ShoppingListProps,
        prevState: ShoppingListState
    ) {
        // push new props into this list
        const didPropsListChange = !_.isEqual(
            this.props.shoppingList,
            prevProps.shoppingList
        );

        if (didPropsListChange) {
            this.setState({ liveShoppingList: this.props.shoppingList });
        }
    }

    handleItemUpdate<K extends keyof ShoppingListItem>(
        id: number,
        key: K,
        value: ShoppingListItem[K]
    ) {
        const newItems = _.cloneDeep(this.state.liveShoppingList);

        const newItem = newItems.find((c) => c.id === id);

        if (newItem === undefined) {
            console.error("could not find ID?");
            return;
        }

        newItem[key] = value;

        // update state so changes feel live
        this.setState({ liveShoppingList: newItems });

        // update server so changes are saved -- this will send props back through
        GLOBAL_DATA_LAYER.updateShoppingListItem(newItem);
    }

    clearBoughtItems() {
        const shouldDelete = window.confirm(
            "Sure you want to remove all checked items?"
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

    render() {
        const shoppingList = this.state.liveShoppingList;

        const listGroups = _.groupBy(
            shoppingList,
            (c) =>
                GLOBAL_DATA_LAYER.getIngredient(c.ingredientAmount.ingredientId)
                    ?.aisle || "unknown"
        );

        console.log("list groups", listGroups);

        return (
            <div>
                <H2>add a new item</H2>

                <p>some form for adding a loose item</p>

                <H2>current list</H2>

                <Button
                    text="delete all"
                    intent="danger"
                    onClick={() => this.clearAllItems()}
                />

                <Button
                    text="delete checked"
                    intent="warning"
                    onClick={() => this.clearBoughtItems()}
                />

                {_.map(listGroups, (groupOfItems, key) => (
                    <div
                        key={key}
                        style={{
                            display: "grid",
                            gridTemplateColumns: "200px 200px 200px auto",
                        }}
                    >
                        <div style={{ gridColumn: "1/5" }}>
                            <H3>{key}</H3>
                        </div>

                        {_.map(
                            _.groupBy(
                                groupOfItems,
                                (c) => c.ingredientAmount.ingredientId
                            ),
                            (_item, ingredientId) => {
                                // TODO: process subsequent items to combine amounts
                                // TODO: show the recipe name
                                // TODO: show the amount and modifier details
                                const item = _item[0];
                                const ing = GLOBAL_DATA_LAYER.getIngredient(
                                    item.ingredientAmount.ingredientId
                                );
                                return (
                                    <React.Fragment key={ingredientId}>
                                        <Checkbox
                                            checked={item.isBought}
                                            onChange={handleBooleanChange(
                                                (isBought) =>
                                                    this.handleItemUpdate(
                                                        item.id,
                                                        "isBought",
                                                        isBought
                                                    )
                                            )}
                                            labelElement={
                                                <span
                                                    style={{
                                                        color: item.isBought
                                                            ? "grey"
                                                            : undefined,
                                                        fontWeight: item.isBought
                                                            ? undefined
                                                            : "bold",
                                                    }}
                                                >
                                                    {ing?.name}
                                                </span>
                                            }
                                        />
                                        <div>
                                            {item.isBought
                                                ? null
                                                : _item.map((inAmt) => (
                                                      <p key={inAmt.id}>
                                                          {
                                                              inAmt
                                                                  .ingredientAmount
                                                                  .amount
                                                          }{" "}
                                                          {
                                                              inAmt
                                                                  .ingredientAmount
                                                                  .unit
                                                          }{" "}
                                                          (
                                                          {
                                                              inAmt
                                                                  .ingredientAmount
                                                                  .modifier
                                                          }
                                                          )
                                                      </p>
                                                  ))}
                                        </div>

                                        <div>
                                            {item.isBought
                                                ? null
                                                : _item.map((inAmt) => (
                                                      <p
                                                          key={inAmt.id}
                                                          style={{
                                                              fontStyle:
                                                                  "italic",
                                                          }}
                                                      >
                                                          {
                                                              GLOBAL_DATA_LAYER.getRecipe(
                                                                  inAmt.recipeId
                                                              )?.name
                                                          }
                                                      </p>
                                                  ))}
                                        </div>

                                        <div>
                                            <EditableText
                                                defaultValue={ing?.aisle}
                                                onConfirm={(newAisle) =>
                                                    this.updateAisle(
                                                        ing,
                                                        newAisle
                                                    )
                                                }
                                            />
                                        </div>
                                    </React.Fragment>
                                );
                            }
                        )}
                    </div>
                ))}
            </div>
        );
    }
    updateAisle(ing: Ingredient | undefined, newAisle: string): void {
        if (ing === undefined) {
            return;
        }

        const newIng = _.cloneDeep(ing);
        newIng.aisle = newAisle;

        GLOBAL_DATA_LAYER.updateIngredient(newIng);
    }
}
