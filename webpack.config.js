const HtmlWebPackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  devtool: 'inline-source-map',
  devServer: {
    // These headers are critical!
    // SharedArrayBuffer requires these strong constraints due to Spectre etc
    // details: https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/crossOriginIsolated
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: { loader: 'html-loader' },
      }
    ]
  },
  resolve: {
    extensions: [ '.js' ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './src/index.html',
      filename: './index.html',
    })
  ]
};
