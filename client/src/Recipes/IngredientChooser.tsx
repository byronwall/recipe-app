import { MenuItem } from "@blueprintjs/core"
import { ItemPredicate, ItemRenderer, Suggest } from "@blueprintjs/select"
import React from "react"
import { Subscribe, Container } from "unstated"

import { DataLayer } from "../DataLayer"
import { Ingredient } from "../models"

interface IngredientChooserProps {
    onItemChange(newIngredient: Ingredient): void
}
interface IngredientChooserState {}

const IngredientSuggest = Suggest.ofType<Ingredient>()

export class IngredientChooser extends React.Component<
    IngredientChooserProps,
    IngredientChooserState
> {
    constructor(props: IngredientChooserProps) {
        super(props)

        this.state = {}
    }

    componentDidMount() {}

    componentDidUpdate(
        prevProps: IngredientChooserProps,
        prevState: IngredientChooserState
    ) {}

    render() {
        return (
            <Subscribe to={[DataLayer]}>
                {(data: DataLayer) => (
                    <div>
                        <IngredientSuggest
                            inputValueRenderer={(item) => item.name}
                            items={data.state.ingredients}
                            onItemSelect={(item) =>
                                this.props.onItemChange(item)
                            }
                            itemRenderer={renderFilm}
                            itemPredicate={filterFilm}
                        />
                    </div>
                )}
            </Subscribe>
        )
    }
}

export const renderFilm: ItemRenderer<Ingredient> = (
    ingredient,
    { handleClick, modifiers, query }
) => {
    if (!modifiers.matchesPredicate) {
        return null
    }
    const text = `${ingredient.name}`
    return (
        <MenuItem
            active={modifiers.active}
            disabled={modifiers.disabled}
            label={ingredient.plu}
            key={ingredient.id}
            onClick={handleClick}
            text={highlightText(text, query)}
        />
    )
}

export const filterFilm: ItemPredicate<Ingredient> = (
    query,
    ingredient,
    _index,
    exactMatch
) => {
    const normalizedTitle = ingredient.name.toLowerCase()
    const normalizedQuery = query.toLowerCase()

    if (exactMatch) {
        return normalizedTitle === normalizedQuery
    } else {
        return (
            `${ingredient.plu}. ${normalizedTitle} ${ingredient.name}`.indexOf(
                normalizedQuery
            ) >= 0
        )
    }
}

function highlightText(text: string, query: string) {
    let lastIndex = 0
    const words = query
        .split(/\s+/)
        .filter((word) => word.length > 0)
        .map(escapeRegExpChars)
    if (words.length === 0) {
        return [text]
    }
    const regexp = new RegExp(words.join("|"), "gi")
    const tokens: React.ReactNode[] = []
    while (true) {
        const match = regexp.exec(text)
        if (!match) {
            break
        }
        const length = match[0].length
        const before = text.slice(lastIndex, regexp.lastIndex - length)
        if (before.length > 0) {
            tokens.push(before)
        }
        lastIndex = regexp.lastIndex
        tokens.push(<strong key={lastIndex}>{match[0]}</strong>)
    }
    const rest = text.slice(lastIndex)
    if (rest.length > 0) {
        tokens.push(rest)
    }
    return tokens
}

function escapeRegExpChars(text: string) {
    return text.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1")
}
