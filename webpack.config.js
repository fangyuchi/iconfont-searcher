const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  // mode: "development",
  mode: "production",
  entry: {
    "content-script": path.resolve(__dirname, "./src/content-script.ts"),
    "popup": path.resolve(__dirname, "./src/popup.tsx"),
    "background": path.resolve(__dirname, "./src/background.ts")
  },
  output: {
    path: path.resolve(__dirname, "extension"),
    filename: "[name].js"
  },
  module: {
    rules: [
      {
        test: /\.(scss|css)$/,
        use: ["style-loader", "css-loader", "postcss-loader", "sass-loader"],
      },
      {
        test: /\.(js|jsx)$/,
        include: [/src/],
        use: ["babel-loader"],
      },
      {
        test: /\.(tsx|ts)?$/,
        include: [/src/],
        use: [{ loader: "babel-loader" }, { loader: "ts-loader" }]
      }
    ]
  },
  resolve: {
    extensions: [".js", ".tsx", ".ts"],
    alias: {
      '@': path.join(__dirname, './src')
    }
  },
  devtool: 'source-map',
  plugins: [
    new CopyWebpackPlugin([{ from: "assets" }])
  ]
};
