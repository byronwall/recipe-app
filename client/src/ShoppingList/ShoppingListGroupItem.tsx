import { Button, Checkbox } from "@blueprintjs/core";
import _ from "lodash";
import React from "react";
import { GLOBAL_DATA_LAYER } from "..";
import { handleBooleanChange } from "../helpers";
import { ShoppingListItem } from "../models";
import { KrogerSearch } from "./KrogerSearch";
import { getIngredientText } from "./ShoppingList";

interface ShoppingListGroupItemProps {
    handleItemUpdate<K extends keyof ShoppingListItem>(
        id: number,
        key: K,
        value: ShoppingListItem[K]
    ): void;

    handleNewAisle(item: ShoppingListItem): void;

    items: ShoppingListItem[];
}
interface ShoppingListGroupItemState {
    hasKrogerSearchOpen: boolean;
}

export class ShoppingListGroupItem extends React.Component<
    ShoppingListGroupItemProps,
    ShoppingListGroupItemState
> {
    constructor(props: ShoppingListGroupItemProps) {
        super(props);

        this.state = {
            hasKrogerSearchOpen: false,
        };
    }

    componentDidMount() {}

    componentDidUpdate(
        prevProps: ShoppingListGroupItemProps,
        prevState: ShoppingListGroupItemState
    ) {}

    render() {
        const _item = this.props.items;
        const item = this.props.items[0];
        const ing = GLOBAL_DATA_LAYER.getIngredient(
            item.ingredientAmount.ingredientId
        );
        return (
            <div style={{ display: "flex" }} className="list-group-item">
                <div>
                    <Checkbox
                        checked={item.isBought}
                        onChange={handleBooleanChange((isBought) =>
                            this.props.handleItemUpdate(
                                item.id,
                                "isBought",
                                isBought
                            )
                        )}
                        labelElement={
                            <span
                                style={{
                                    color: item.isBought ? "grey" : undefined,
                                    fontWeight: item.isBought
                                        ? undefined
                                        : "bold",
                                }}
                            >
                                {item.textOnly ?? ing?.name}
                            </span>
                        }
                    />
                </div>
                <div>
                    {item.isBought
                        ? null
                        : _item.map((inAmt) => (
                              <p key={inAmt.id}>{getIngredientText(inAmt)}</p>
                          ))}
                </div>

                <div>
                    {item.isBought
                        ? null
                        : _item.map((inAmt) => (
                              <p
                                  key={inAmt.id}
                                  style={{
                                      fontStyle: "italic",
                                      textOverflow: "ellipsis",
                                      overflow: "hidden",
                                      whiteSpace: "nowrap",
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
                    {item.isBought ? null : (
                        <>
                            <Button
                                icon="edit"
                                onClick={() => this.props.handleNewAisle(item)}
                                minimal
                                small
                            />
                            <Button
                                icon="search"
                                onClick={() =>
                                    this.setState((prevState) => {
                                        return {
                                            hasKrogerSearchOpen: !prevState.hasKrogerSearchOpen,
                                        };
                                    })
                                }
                                intent="primary"
                                active={this.state.hasKrogerSearchOpen}
                                minimal
                                small
                            />
                        </>
                    )}
                </div>

                <div style={{ overflow: "auto" }}>
                    {this.state.hasKrogerSearchOpen && (
                        <KrogerSearch
                            initialSearch={ing?.name ?? ""}
                            onMarkComplete={() => this.handleCartComplete()}
                        />
                    )}
                </div>
            </div>
        );
    }
    handleCartComplete(): void {
        const addCartItem = this.props.items[0];
        // take the active item and mark it bought

        if (addCartItem === undefined) {
            return;
        }

        const newActiveItem = _.cloneDeep(addCartItem);

        newActiveItem.isBought = true;

        GLOBAL_DATA_LAYER.updateShoppingListItem([newActiveItem]);

        this.setState({ hasKrogerSearchOpen: false });
    }
}
