export default {
    transform: {
        "^.+\\.[t|j]sx?$": "babel-jest"
    },
    collectCoverage: true,
    transformIgnorePatterns: [
        "<rootDir>/node_modules/(?!lodash-es)"
    ]
};