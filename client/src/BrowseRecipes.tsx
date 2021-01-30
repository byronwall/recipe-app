import {
    Button,
    Card,
    FormGroup,
    H2,
    H3,
    H4,
    InputGroup,
    Spinner,
} from "@blueprintjs/core";
import axios from "axios";
import debug from "debug";
import React from "react";
import { BrowseRecipeViewer } from "./BrowseRecipeViewer";
import { handleStringChange, toPrecisionIfNumber } from "./helpers";
import { RecipeSearchData, RecipeSearchParams } from "./models";
import { OverlayCenter } from "./OverlayCenter";

const log = debug("recipe:browse");

interface BrowseRecipesProps {}
interface BrowseRecipesState {
    searchTerm: string;
    searchData: RecipeSearchData[];

    viewerItem: RecipeSearchData | undefined;
    isSearching: boolean;
}

export class BrowseRecipes extends React.Component<
    BrowseRecipesProps,
    BrowseRecipesState
> {
    constructor(props: BrowseRecipesProps) {
        super(props);

        this.state = {
            searchTerm: "",
            searchData: [],
            viewerItem: undefined,
            isSearching: false,
        };
    }

    componentDidMount() {}

    componentDidUpdate(
        prevProps: BrowseRecipesProps,
        prevState: BrowseRecipesState
    ) {}

    render() {
        return (
            <div>
                <H2>find new recipes</H2>
                <p>
                    Type a search term to find recipes. Click on the recipe
                    header to see steps and ingredients and to save.
                </p>
                <div className="flex" style={{ alignItems: "flex-start" }}>
                    <FormGroup>
                        <InputGroup
                            value={this.state.searchTerm}
                            onChange={handleStringChange((searchTerm) =>
                                this.setState({ searchTerm })
                            )}
                        />
                    </FormGroup>
                    <Button icon="search" onClick={() => this.handleSearch()} />
                </div>

                {this.state.isSearching && <Spinner />}

                <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {this.state.searchData.map((item) => (
                        <Card key={item.url} style={{ width: 300 }}>
                            <H3
                                className="dotdotdot"
                                onClick={() => this.handleViewerOpen(item)}
                                style={{ cursor: "pointer", color: "#0E5A8A" }}
                            >
                                {item.name}
                            </H3>

                            <H4>
                                {item.reviewCount} |{" "}
                                {toPrecisionIfNumber(item.stars)}
                            </H4>
                            <img
                                src={item.imageUrl}
                                style={{ maxWidth: "100%" }}
                            />
                        </Card>
                    ))}
                </div>

                <OverlayCenter
                    height={600}
                    width={600}
                    isOpen={this.state.viewerItem !== undefined}
                    onClose={() => this.setState({ viewerItem: undefined })}
                >
                    <BrowseRecipeViewer activeItem={this.state.viewerItem} />
                </OverlayCenter>
            </div>
        );
    }

    /**
     * This will open the viewer for the given recipe
     * @param item Item to show
     */
    handleViewerOpen(item: RecipeSearchData) {
        this.setState({ viewerItem: item });
    }

    /** handle the search button click */
    async handleSearch() {
        // fire off a post to the serve

        this.setState({ isSearching: true, searchData: [] });

        const postData: RecipeSearchParams = {
            query: this.state.searchTerm,
        };

        const res = await axios.post("/api/recipe_search", postData);

        const data = res.data as RecipeSearchData[];
        log("results", data);

        this.setState({ searchData: data, isSearching: false });
    }
}
