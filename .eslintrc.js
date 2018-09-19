module.exports = {
    "extends": "google",
    "parserOptions": {
        "ecmaVersion": 2017,
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true
        }
    },
    "env": {
        "node": true,
        "es6": true
    },
    "globals":{
        "jQuery": false,
        "$": true
    },
    "rules": {
        "comma-dangle": ["error", "never"],
        "max-len": ["error", 140, 4],
        "padded-blocks": "off",
        "no-trailing-spaces": "off",
        "require-jsdoc": "off",
        "no-undef": "error",
        "curly": ["error", "multi-line"],
        "arrow-parens": [2, "as-needed"],
        "quote-props": ["error", "as-needed", { "keywords": true, "unnecessary": true }],
        "no-unused-expressions": "error",
        "no-console" : 2
    }
};
