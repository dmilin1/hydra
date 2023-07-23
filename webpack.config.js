const path = require('path');
const WrapperPlugin = require('wrapper-webpack-plugin');

module.exports = {
  entry: './injectedJS/index.js',
  output: {
    path: path.resolve(__dirname),
    filename: './components/WebViewer/injected.js',
  },
  watch: true,
  mode: 'production',
  plugins: [
    new WrapperPlugin({
        header: 'export default `\n',
        footer: '\n`;',
    }),
  ]
};