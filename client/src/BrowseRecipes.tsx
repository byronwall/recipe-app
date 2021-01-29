import { Button, FormGroup, InputGroup } from "@blueprintjs/core";
import axios from "axios";
import debug from "debug";
import React from "react";
import { handleStringChange } from "./helpers";
import { RecipeSearchData, RecipeSearchParams } from "./models";

const log = debug("recipe:browse");

interface BrowseRecipesProps {}
interface BrowseRecipesState {
    searchTerm: string;
    searchData: RecipeSearchData[];
}

export class BrowseRecipes extends React.Component<
    BrowseRecipesProps,
    BrowseRecipesState
> {
    constructor(props: BrowseRecipesProps) {
        super(props);

        this.state = { searchTerm: "", searchData: [] };
    }

    componentDidMount() {}

    componentDidUpdate(
        prevProps: BrowseRecipesProps,
        prevState: BrowseRecipesState
    ) {}

    render() {
        return (
            <div>
                <p>BrowseRecipes</p>
                <FormGroup>
                    <InputGroup
                        value={this.state.searchTerm}
                        onChange={handleStringChange((searchTerm) =>
                            this.setState({ searchTerm })
                        )}
                    />
                </FormGroup>
                <Button text="search" onClick={() => this.handleSearch()} />

                <p>results</p>

                {this.state.searchData.map((item) => (
                    <div key={item.url}>
                        <a href={item.url}>{item.name}</a>
                        <img src={item.imageUrl} />
                    </div>
                ))}
            </div>
        );
    }

    /** handle the search button click */
    async handleSearch() {
        // fire off a post to the serve

        const postData: RecipeSearchParams = {
            query: this.state.searchTerm,
        };

        const res = await axios.post("/api/recipe_search", postData);

        const data = res.data as RecipeSearchData[];
        log("results", data);

        this.setState({ searchData: data });
    }
}
