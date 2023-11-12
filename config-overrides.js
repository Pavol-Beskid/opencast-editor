// Overrides to make emotion css work with createReactApp
const { override, addBabelPreset, addBabelPlugins } = require('customize-cra')

module.exports = override(
  addBabelPreset('@emotion/babel-preset-css-prop'),
  addBabelPlugins(
    "babel-plugin-istanbul",
  )
)
