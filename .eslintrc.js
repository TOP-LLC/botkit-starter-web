module.exports = {
    "parser": "babel-eslint",
    "rules": {
      "graphql/template-strings": ['error', {
        // Import default settings for your GraphQL client. Supported values:
        // 'apollo', 'relay', 'lokka', 'literal'
        "env": 'lokka',
         // Optional, the name of the template tag, defaults to 'gql'
        "tagName": 'lokkagql'
        // no need to specify schema here, it will be automatically determined using .graphqlconfig
      }],
      "env": {
        "browser": true,
        "es6": true
        },
        "indent": [
            "error",
            "tab"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "never"
        ],
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module"
    },
    "plugins": [
      'graphql'
    ]
}