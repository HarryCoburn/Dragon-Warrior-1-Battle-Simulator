module.exports = {
  entry: ["./src/index.js"],
  devtool: "inline-source-map",
  output: {
    path: __dirname + "/dist",
    filename: "[name].js"
  },
  watch: true,
  devServer: {
    contentBase: "./src",
    compress: true,
    port: 9000
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  }
};
