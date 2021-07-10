import { Button, InputGroup, Spinner } from "@blueprintjs/core";
import axios from "axios";
import React from "react";
import { globalLog } from "..";
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

export class KrogerSearch extends React.PureComponent<
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
        const { searchTerm } = this.state;
        if (searchTerm !== "") {
            this.handleSearch();
        }
    }

    componentDidUpdate(prevProps: KrogerSearchProps) {
        const { initialSearch } = this.props;
        if (initialSearch !== prevProps.initialSearch) {
            this.setState({ searchTerm: initialSearch }, () =>
                this.handleSearch()
            );
        }
    }

    private handleSearch = async () => {
        const { searchTerm } = this.state;
        // get the search term and hit the api

        this.setState({ isLoading: true });

        const postData: API_KrogerSearch = {
            filterTerm: searchTerm,
        };

        const res = await axios.post<API_KrogerProdRes>(
            "/api/kroger_search",
            postData
        );

        if (res.data?.data) {
            globalLog("kroger return", res.data);

            this.setState({ searchResults: res.data.data });
        } else {
            globalLog("did not receive any search results");
        }

        this.setState({ isLoading: false });
    };

    render() {
        const { onMarkComplete } = this.props;
        const { searchTerm, isLoading, searchResults } = this.state;
        return (
            <div style={{ display: "flex" }}>
                <div style={{ flexShrink: 0 }}>
                    <div>
                        <Button
                            text="mark purchased"
                            onClick={onMarkComplete}
                        />
                    </div>

                    <div style={{ maxWidth: 130 }}>
                        <InputGroup
                            placeholder="search term"
                            value={searchTerm}
                            onChange={handleStringChange((searchTerm) =>
                                this.setState({ searchTerm })
                            )}
                        />
                    </div>

                    <Button
                        text="search"
                        onClick={this.handleSearch}
                        icon="search"
                    />
                </div>

                {isLoading && <Spinner />}

                <div className="flex">
                    {searchResults.map((prod) => (
                        <KrogerItemDisplay key={prod.upc} product={prod} />
                    ))}
                </div>
            </div>
        );
    }
}
