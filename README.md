# Family Recipe App

> [!CAUTION]
> This repo is archived and replaced by [byronwall/recipes-modern](https://github.com/byronwall/recipes-modern).  The new repo is a NextJS app with SSR and self-hostable docker compose.

This is a simple web app for tracking family recipes. Built using Node.JS and React with TypeScript. App is used regularly by family to simplify our lives in the kitchen. Integrates with the Kroger API to support item searches and adding to a shopping cart.

Features:

- Maintains a database of recipes with a cooking mode viewer. Original import done by scrapping our Pepperplate account.
- Ingredients are stored in a "canonical" format where all recipes refer to the same core items. This makes it possible to quickly add recipes and maintain clean data. Custom interface to maintain these ingredients.
- Meal planning allows for tracking a week and creating a shopping list
- Shopping list integrated with Kroger API allowing for item searches and Kroger cart creation

## Screenshots

### Recipe view

Provides a clean view of the ingredients and steps. Supports a two-pane cooking mode where items are shown with checkboxes to track status.

![Recipe view](/docs/recipe.png)

### Meal Planning

Straight forward meal plan with the ability to search and add meals to a given day. Shopping list can be quickly created from new items.

![Meal planning](/docs/meal_plan.png)

### Shopping List

Shopping list organizes by aisle and allows for quick searches and additions to a Kroger cart using the Kroger Developer APIs.

![Shopping list](/docs/shopping.png)
