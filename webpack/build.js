const webpack = require("webpack");
const config=require("./config");

const compiler = webpack(config);

compiler.run((err, stats) => {
    console.log(err);
    console.log(stats);
});