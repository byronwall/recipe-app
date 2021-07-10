import { Button, NumericInput } from "@blueprintjs/core";
import axios from "axios";
import React from "react";
import { globalLog } from "..";
import {
    API_KrogerAddCart,
    API_KrogerAddCartResponse,
    KrogerProduct,
} from "../models";

enum AddToCartState {
    NORMAL = 0,
    ADDING = 1,
    ADDED = 2,
    ERROR = 3,
}

interface KrogerItemDisplayProps {
    product: KrogerProduct;
}
interface KrogerItemDisplayState {
    addCartState: AddToCartState;
    quantityToAdd: number;
}

export class KrogerItemDisplay extends React.Component<
    KrogerItemDisplayProps,
    KrogerItemDisplayState
> {
    constructor(props: KrogerItemDisplayProps) {
        super(props);

        this.state = { addCartState: AddToCartState.NORMAL, quantityToAdd: 1 };
    }

    componentDidMount() {}

    componentDidUpdate(
        prevProps: KrogerItemDisplayProps,
        prevState: KrogerItemDisplayState
    ) {}

    async handleAddToCart(upc: string) {
        if (this.state.addCartState !== AddToCartState.NORMAL) {
            return;
        }
        // fire off a post

        this.setState({ addCartState: AddToCartState.ADDING });

        const postData: API_KrogerAddCart = {
            items: [{ quantity: this.state.quantityToAdd, upc }],
        };

        const url = "/api/kroger_add_cart";
        const result = await axios.post<API_KrogerAddCartResponse>(
            url,
            postData
        );
        globalLog("add cart response", result);

        if (result.data.result) {
            this.setState({ addCartState: AddToCartState.ADDED });
        } else {
            this.setState({ addCartState: AddToCartState.ERROR });
        }
    }

    render() {
        const prod = this.props.product;

        return (
            <div
                key={prod.productId}
                className="flex"
                style={{ width: 200, alignItems: "flex-start" }}
            >
                <div>
                    <div className="flex">
                        <NumericInput
                            value={this.state.quantityToAdd}
                            onValueChange={(newValue) =>
                                this.setState({ quantityToAdd: newValue })
                            }
                            fill
                        />
                        <Button
                            icon={
                                this.state.addCartState === AddToCartState.ADDED
                                    ? "saved"
                                    : this.state.addCartState ===
                                      AddToCartState.ERROR
                                    ? "error"
                                    : "shopping-cart"
                            }
                            onClick={() => this.handleAddToCart(prod.upc)}
                            disabled={
                                this.state.addCartState !==
                                AddToCartState.NORMAL
                            }
                        />
                    </div>
                    {getProductString(prod)}
                </div>

                <img
                    style={{ flexShrink: 0 }}
                    src={
                        prod.images
                            .filter((c) => c.featured)[0]
                            .sizes.find((c) => c.size === "small")?.url
                    }
                />
            </div>
        );
    }
}

function getProductString(prod: KrogerProduct) {
    let price: number | undefined = prod.items[0].price?.promo ?? 0;

    if (price <= 0) {
        price = prod.items[0].price?.regular ?? undefined;
    }

    const priceStr = price === undefined ? "" : " | $" + price.toFixed(2);

    return `${prod.description} | ${prod.items[0].size}${priceStr}`;
}
