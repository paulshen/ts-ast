const {
  override,
  addBabelPlugin,
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
  addBabelPlugin(require("babel-plugin-emotion")),
  addBabelPreset(require("@emotion/babel-preset-css-prop"))
);
