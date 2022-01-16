// eslint-disable-next-line no-undef
module.exports = {
    parser: "@typescript-eslint/parser", // Specifies the ESLint parser

    parserOptions: {
        ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features

        sourceType: "module", // Allows for the use of imports

        ecmaFeatures: {
            jsx: true, // Allows for the parsing of JSX
        },
    },

    settings: {
        react: {
            version: "detect", // Tells eslint-plugin-react to automatically detect the version of React to use
        },
    },
    plugins: ["@typescript-eslint", "react"],

    extends: [
        "eslint:recommended",
        "plugin:react/recommended", // Uses the recommended rules from @eslint-plugin-react
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended", // Uses the recommended rules from @typescript-eslint/eslint-plugin
    ],

    rules: {
        // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
        // e.g. "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-empty-function": 1,
        "@typescript-eslint/explicit-module-boundary-types": 0,
        "react/jsx-no-bind": 1,
        "react/destructuring-assignment": 1,
        "react/no-unused-state": 1,
        "no-case-declarations": 1,
        "react/no-render-return-value": 1,
        "react/no-unescaped-entities": 1,
        "@typescript-eslint/no-empty-interface": 1,
        "react/no-children-prop": 1,
        "prefer-spread": 1,
        "no-constant-condition": 1,
        "@typescript-eslint/ban-types": [
            1,
            {
                extendDefaults: true,
                types: {
                    "{}": false,
                },
            },
        ],
        "@typescript-eslint/ban-ts-comment": 1,
        "prefer-rest-params": 1,
        "react/display-name": 1,
        "react/prop-types": 1,
        "@typescript-eslint/explicit-member-accessibility": "warn",
        "@typescript-eslint/member-ordering": "warn",
    },
};
