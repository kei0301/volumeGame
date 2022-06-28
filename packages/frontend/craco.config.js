/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const path = require("path")
const { getLoader, loaderByName } = require("@craco/craco")

const absolutePath = path.join(__dirname, "../shared")
const shared = path.join(__dirname, "./node_modules/@pricegame/shared")

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      const { isFound, match } = getLoader(webpackConfig, loaderByName("babel-loader"))
      if (isFound) {
        const include = Array.isArray(match.loader.include) ? match.loader.include : [match.loader.include]
        match.loader.include = include.concat(absolutePath, shared)
      }
      return {
        ...webpackConfig,
      }
    },
  },
}
