import { Button, H2, H3 } from "@blueprintjs/core";
import _ from "lodash";
import React from "react";
import { globalLog, GLOBAL_DATA_LAYER } from "..";
import { ActionsComp } from "../MealPlan/ActionsComp";
import {
    getNewId,
    Ingredient,
    IngredientAmount,
    Recipe,
    ShoppingListItem,
} from "../models";
import { OverlayCenter } from "../OverlayCenter";
import { AisleChooser } from "./AisleChooser";
import { KrogerSearch } from "./KrogerSearch";
import { ShoppingListGroup } from "./ShoppingListGroup";

interface ShoppingListProps {
    shoppingList: ShoppingListItem[];
}
interface ShoppingListState {
    liveShoppingList: ShoppingListItem[];

    isCartAddOpen: boolean;
    addCartSearchTerm: string;
    addCartItem: ShoppingListItem | undefined;

    isAisleEditOpen: boolean;
    itemEditAisle: ShoppingListItem | undefined;
}

export function getLooseIngredientAmount(): IngredientAmount {
    return {
        amount: 1,
        ingredientId: -getNewId(),
        modifier: "",
        unit: "",
    };
}

export class ShoppingList extends React.Component<
    ShoppingListProps,
    ShoppingListState
> {
    constructor(props: ShoppingListProps) {
        super(props);

        this.state = {
            liveShoppingList: props.shoppingList,

            isCartAddOpen: false,
            addCartSearchTerm: "",
            addCartItem: undefined,
            isAisleEditOpen: false,
            itemEditAisle: undefined,
        };

        this.handleItemUpdate = this.handleItemUpdate.bind(this);
        this.handleNewAisle = this.handleNewAisle.bind(this);
        this.handleSearchUpdate = this.handleSearchUpdate.bind(this);
    }

    componentDidMount() {
        // TODO: get auth status from server
    }

    componentDidUpdate(prevProps: ShoppingListProps) {
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

        const itemsToUpdate = [newItem];

        if (key === "isBought") {
            // need to update all with that ingredient id
            const ingId = newItem.ingredientAmount.ingredientId;

            const isBought = value as boolean;

            newItems
                .filter((c) => c.id !== id)
                .filter((c) => c.ingredientAmount.ingredientId === ingId)
                .forEach((c) => {
                    c.isBought = isBought;

                    itemsToUpdate.push(c);
                });
        }

        newItem[key] = value;

        // update state so changes feel live
        this.setState({ liveShoppingList: newItems });

        // update server so changes are saved -- this will send props back through
        GLOBAL_DATA_LAYER.updateShoppingListItem(itemsToUpdate);
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

        globalLog("bought IDs", idsBoughtItems);

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

        const activeRecipes = _.uniq(
            this.state.liveShoppingList.map((c) => c.recipeId)
        )
            .map((c) => GLOBAL_DATA_LAYER.getRecipe(c))
            .filter((c) => c !== undefined) as Recipe[];

        const listGroups = _.groupBy(
            shoppingList,
            (c) =>
                GLOBAL_DATA_LAYER.getIngredient(c.ingredientAmount.ingredientId)
                    ?.aisle || "unknown"
        );

        const groupNames = Object.keys(listGroups).sort();

        globalLog("list groups", listGroups);

        return (
            <div>
                <OverlayCenter
                    isOpen={this.state.isCartAddOpen}
                    onClose={() => this.setState({ isCartAddOpen: false })}
                    height={400}
                    width={600}
                >
                    <KrogerSearch
                        initialSearch={this.state.addCartSearchTerm}
                        onMarkComplete={() => this.handleCartComplete()}
                    />
                </OverlayCenter>

                <OverlayCenter
                    isOpen={this.state.isAisleEditOpen}
                    onClose={() => this.setState({ isAisleEditOpen: false })}
                    height={200}
                    width={250}
                >
                    <AisleChooser
                        item={this.state.itemEditAisle}
                        onNewAisle={(ing, newAisle) => {
                            this.setState({
                                isAisleEditOpen: false,
                                itemEditAisle: undefined,
                            });
                            this.updateAisle(ing, newAisle);
                        }}
                    />
                </OverlayCenter>

                <ActionsComp>
                    <Button
                        text="delete all"
                        intent="danger"
                        onClick={() => this.clearAllItems()}
                        icon="trash"
                        minimal
                    />

                    <Button
                        text="delete bought"
                        intent="warning"
                        onClick={() => this.clearBoughtItems()}
                        icon="small-cross"
                        minimal
                    />

                    <Button
                        text="add loose item"
                        onClick={() => this.handleLooseAdd()}
                        icon="plus"
                        minimal
                    />
                </ActionsComp>

                {!GLOBAL_DATA_LAYER.state.hasKrogerAuth && (
                    <div>
                        <Button
                            text="authorize with Kroger"
                            onClick={() => this.handleKrogerAuthReq()}
                        />
                    </div>
                )}

                <H2>shopping list</H2>

                <H3>recipes included</H3>

                {activeRecipes.map((recipe) => (
                    <div key={recipe.id}>
                        <Button
                            minimal
                            intent="danger"
                            icon="cross"
                            onClick={() =>
                                this.removeRecipeFromShoppingList(recipe.id)
                            }
                        />
                        {recipe.name}
                    </div>
                ))}

                {groupNames.map((key) => {
                    const groupOfItems = listGroups[key];

                    return (
                        <ShoppingListGroup
                            key={key}
                            groupOfItems={groupOfItems}
                            sectionName={key}
                            handleItemUpdate={this.handleItemUpdate}
                            handleNewAisle={this.handleNewAisle}
                            handleSearchUpdate={this.handleSearchUpdate}
                        />
                    );
                })}
            </div>
        );
    }

    /**
     * Method to add a single "loose" item to the shopping list
     */
    handleLooseAdd() {
        const name = window.prompt("What item do you want to add?");

        if (!name) {
            return;
        }

        const newItem: ShoppingListItem = {
            id: getNewId(),
            ingredientAmount: getLooseIngredientAmount(),
            isBought: false,
            recipeId: -1,
            textOnly: name,
        };

        GLOBAL_DATA_LAYER.addItemsToShoppingList([newItem]);
    }
    handleNewAisle(item: ShoppingListItem) {
        this.setState({
            isAisleEditOpen: true,
            itemEditAisle: item,
        });
    }
    handleCartComplete(): void {
        // take the active item and mark it bought

        if (this.state.addCartItem === undefined) {
            return;
        }

        const newActiveItem = _.cloneDeep(this.state.addCartItem);

        newActiveItem.isBought = true;

        GLOBAL_DATA_LAYER.updateShoppingListItem([newActiveItem]);

        this.setState({ isCartAddOpen: false });
    }
    handleSearchUpdate(name: string | undefined, item: ShoppingListItem) {
        if (name === undefined) {
            return;
        }

        this.setState({
            addCartSearchTerm: name,
            isCartAddOpen: true,
            addCartItem: item,
        });
    }
    handleKrogerAuthReq() {
        const SCOPES = "product.compact cart.basic:write";

        const CLIENT_ID =
            "wallfamilyrecipes-2bfdb9e9acc3f08e8b36969f52705be43361553067000321029";

        const REDIRECT_URI =
            window.location.protocol + "//" + window.location.host + "/auth";

        const url =
            "https://api.kroger.com/v1/connect/oauth2/authorize?scope=" +
            encodeURIComponent(SCOPES) +
            "&response_type=code&client_id=" +
            encodeURIComponent(CLIENT_ID) +
            "&redirect_uri=" +
            encodeURIComponent(REDIRECT_URI);

        window.open(url);
    }
    removeRecipeFromShoppingList(id: number) {
        GLOBAL_DATA_LAYER.removeRecipeFromShoppingList(id);
    }
    updateAisle(ing: Ingredient | undefined, newAisle: string): void {
        if (ing === undefined || ing.aisle === newAisle) {
            return;
        }

        const newIng = _.cloneDeep(ing);

        newIng.aisle = newAisle;

        GLOBAL_DATA_LAYER.updateIngredient(newIng);
    }
}

export function getIngredientText(inAmt: ShoppingListItem) {
    const amount = inAmt.ingredientAmount.amount;
    let unit = inAmt.ingredientAmount.unit;
    if (unit !== "") {
        unit = " " + unit;
    }
    let modifier = inAmt.ingredientAmount.modifier;
    if (modifier !== "") {
        modifier = " (" + modifier + ")";
    }
    return `${amount}${unit}${modifier}`;
}
