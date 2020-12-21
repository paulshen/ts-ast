const {
  override,
  addBabelPreset,
  addWebpackPlugin,
} = require("customize-cra");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

module.exports = override(
  addWebpackPlugin(
    new MonacoWebpackPlugin({
      languages: ["typescript"],
    })
  ),
  addBabelPreset(require("@emotion/babel-preset-css-prop"))
);
