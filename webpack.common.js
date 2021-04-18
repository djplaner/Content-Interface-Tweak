const path = require('path');

module.exports = {
  entry: {
    app: './src/content.js',
  },
  output: {
    filename: 'content-min.js',
    path: path.resolve(__dirname, 'dist'),
  },
};