const path = require("path");

module.exports = {
    entry: {
        injectFloatingButton: path.join(__dirname, "extension/chrome/injectFloatingButton.tsx")
    },
    output: {
        path: path.join(__dirname, ".extension"),
        filename: "[name].js",
    },
    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: /\.tsx?$/,
                use: [{
                    loader: 'ts-loader',
                    options:{
                        configFile: "tsconfig.extension.json"
                    }
                }]
            },
            // Treat src/css/app.css as a global stylesheet
            {
                test: /\app.css$/,
                use: [
                    "style-loader",
                    "css-loader",
                    "postcss-loader",
                ],
            },
            // Load .module.css files as CSS modules
            {
                test: /\.module.css$/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: {
                            modules: true,
                        },
                    },
                    "postcss-loader",
                ],
            },
            {
                test: /\.svg$/i,
                issuer: /\.[jt]sx?$/,
                use: ['@svgr/webpack']
            }
        ],
    },
    // Setup @src path resolution for TypeScript files
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
};
