import { Button, FormGroup, InputGroup, Spinner } from "@blueprintjs/core";
import axios from "axios";
import React from "react";
import { handleStringChange } from "../helpers";
import { API_KrogerProdRes, API_KrogerSearch, KrogerProduct } from "../models";
import { KrogerItemDisplay } from "./KrogerItemDisplay";

interface KrogerSearchProps {
    initialSearch: string;

    onMarkComplete(): void;
}
interface KrogerSearchState {
    searchTerm: string;
    searchResults: KrogerProduct[];
    isLoading: boolean;
}

export class KrogerSearch extends React.Component<
    KrogerSearchProps,
    KrogerSearchState
> {
    constructor(props: KrogerSearchProps) {
        super(props);

        this.state = {
            searchTerm: props.initialSearch,
            searchResults: [],
            isLoading: false,
        };
    }

    componentDidMount() {
        if (this.state.searchTerm !== "") {
            this.handleSearch();
        }
    }

    componentDidUpdate(
        prevProps: KrogerSearchProps,
        prevState: KrogerSearchState
    ) {
        if (this.props.initialSearch !== prevProps.initialSearch) {
            this.setState({ searchTerm: this.props.initialSearch }, () =>
                this.handleSearch()
            );
        }
    }

    async handleSearch() {
        // get the search term and hit the api

        this.setState({ isLoading: true });

        const postData: API_KrogerSearch = {
            filterTerm: this.state.searchTerm,
        };

        const res = await axios.post<API_KrogerProdRes>(
            "/api/kroger_search",
            postData
        );

        if (res.data) {
            console.log("kroger return", res.data);

            this.setState({ searchResults: res.data.data });
        }

        this.setState({ isLoading: false });
    }

    render() {
        return (
            <div>
                <div>
                    <Button
                        text="mark item purchased"
                        onClick={() => this.props.onMarkComplete()}
                    />
                </div>

                <div className="flex">
                    <FormGroup>
                        <InputGroup
                            placeholder="search term"
                            value={this.state.searchTerm}
                            onChange={handleStringChange((searchTerm) =>
                                this.setState({ searchTerm })
                            )}
                        />
                    </FormGroup>

                    <Button text="search" onClick={() => this.handleSearch()} />
                </div>

                {this.state.isLoading && <Spinner />}

                <div className="flex" style={{ flexWrap: "wrap" }}>
                    {this.state.searchResults.map((prod) => (
                        <KrogerItemDisplay key={prod.upc} product={prod} />
                    ))}
                </div>
            </div>
        );
    }
}
